#!/usr/bin/env python3
"""
Simple startup script for NegotiAI Coach
No Docker required - runs everything in one process
Includes automatic virtual environment management
"""

import sys
import os
import subprocess
import time
import platform
from pathlib import Path

# Colors for terminal
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{text}{Colors.ENDC}")


def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")


def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")


def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")


def print_info(text):
    print(f"{Colors.OKCYAN}→ {text}{Colors.ENDC}")


def get_venv_path():
    """Get virtual environment path"""
    return Path("venv")


def is_in_venv():
    """Check if running inside virtual environment"""
    return hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )


def create_venv():
    """Create virtual environment if it doesn't exist"""
    venv_path = get_venv_path()

    if venv_path.exists():
        print_success(f"Virtual environment exists: {venv_path}")
        return True

    print_info("Creating virtual environment...")
    try:
        subprocess.run([sys.executable, "-m", "venv", str(venv_path)], check=True)
        print_success(f"Virtual environment created: {venv_path}")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to create virtual environment: {e}")
        return False


def get_venv_python():
    """Get path to Python in virtual environment"""
    venv_path = get_venv_path()

    if platform.system() == "Windows":
        return venv_path / "Scripts" / "python.exe"
    else:
        return venv_path / "bin" / "python"


def get_venv_pip():
    """Get path to pip in virtual environment"""
    venv_path = get_venv_path()

    if platform.system() == "Windows":
        return venv_path / "Scripts" / "pip.exe"
    else:
        return venv_path / "bin" / "pip"


def activate_venv_instructions():
    """Print instructions to activate virtual environment"""
    venv_path = get_venv_path()

    print_info("Pour activer l'environnement virtuel manuellement :")
    if platform.system() == "Windows":
        print(f"  {venv_path}\\Scripts\\activate")
    else:
        print(f"  source {venv_path}/bin/activate")


def install_dependencies_in_venv():
    """Install dependencies in virtual environment"""
    pip_path = get_venv_pip()

    print_info("Installing dependencies in virtual environment...")
    try:
        subprocess.run(
            [str(pip_path), "install", "-r", "requirements.txt"],
            check=True
        )
        print_success("Dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install dependencies: {e}")
        return False


def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major == 3 and version.minor >= 11:
        print_success(f"Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print_error(f"Python 3.11+ required (you have {version.major}.{version.minor}.{version.micro})")
        return False


def check_dependencies():
    """Check if required packages are installed"""
    # If in venv, use venv's Python to check
    if is_in_venv():
        try:
            import fastapi
            import uvicorn
            print_success("Core dependencies installed")
            return True
        except ImportError as e:
            print_error(f"Missing dependencies: {e}")
            return False
    else:
        # Not in venv, will create one and install there
        return False


def check_env_file():
    """Check if .env file exists"""
    env_path = Path(".env")
    if env_path.exists():
        print_success(".env file found")
        return True
    else:
        print_warning(".env file not found")
        print_info("Creating from .env.example...")

        example_path = Path(".env.example")
        if example_path.exists():
            import shutil
            shutil.copy(example_path, env_path)
            print_success(".env file created")
            print_warning("Please edit .env and add your API keys!")
            return True
        else:
            print_error(".env.example not found")
            return False


def check_port_available(port):
    """Check if port is available"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', port))
    sock.close()
    return result != 0


def start_backend():
    """Start FastAPI backend"""
    print_header("Starting Backend Server...")

    if not check_port_available(8000):
        print_error("Port 8000 already in use")
        print_info("Stop the existing process or use a different port")
        return None

    try:
        # Use venv Python if available, otherwise system Python
        python_exe = get_venv_python() if get_venv_path().exists() else sys.executable

        # Start uvicorn
        cmd = [
            str(python_exe), "-m", "uvicorn",
            "backend.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ]

        # Don't capture output - let it show in terminal
        process = subprocess.Popen(cmd)

        # Wait a bit for startup
        time.sleep(3)

        if process.poll() is None:
            print_success("Backend running on http://localhost:8000")
            return process
        else:
            print_error("Backend failed to start")
            print_error("Check the error messages above")
            return None

    except Exception as e:
        print_error(f"Failed to start backend: {e}")
        return None


def start_frontend():
    """Start React frontend"""
    print_header("Starting Frontend...")

    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print_error("Frontend directory not found")
        return None

    # Check if node_modules exists
    node_modules = frontend_path / "node_modules"
    if not node_modules.exists():
        print_warning("Node modules not installed")
        print_info("Run: cd frontend && npm install")
        return None

    if not check_port_available(3000):
        print_warning("Port 3000 already in use (frontend may already be running)")
        return None

    try:
        cmd = ["npm", "start"]

        process = subprocess.Popen(
            cmd,
            cwd=str(frontend_path),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        time.sleep(3)

        if process.poll() is None:
            print_success("Frontend running on http://localhost:3000")
            return process
        else:
            print_warning("Frontend startup in progress...")
            return process

    except FileNotFoundError:
        print_error("npm not found. Please install Node.js")
        return None
    except Exception as e:
        print_error(f"Failed to start frontend: {e}")
        return None


def open_browser(url):
    """Open browser to URL"""
    import webbrowser
    try:
        webbrowser.open(url)
        print_success(f"Opened {url} in browser")
    except Exception as e:
        print_info(f"Please open {url} in your browser")


def main():
    """Main startup routine"""
    print_header("🎯 NegotiAI Coach - Simple Startup")
    print(f"{Colors.BOLD}Starting all services in standalone mode (no Docker required){Colors.ENDC}\n")

    # Pre-flight checks
    print_header("Pre-flight Checks")

    if not check_python_version():
        sys.exit(1)

    # Virtual environment setup
    print_header("Virtual Environment Setup")

    if is_in_venv():
        print_success("Already running in virtual environment")
    else:
        print_info("Not in virtual environment - setting up...")

        if not create_venv():
            print_error("Failed to create virtual environment")
            response = input("Continue without venv? (y/n): ")
            if response.lower() != 'y':
                sys.exit(1)
        else:
            # Install dependencies in venv
            if not install_dependencies_in_venv():
                print_error("Failed to install dependencies")
                sys.exit(1)

            # Restart script in venv
            print_info("Restarting in virtual environment...")
            venv_python = get_venv_python()
            os.execv(str(venv_python), [str(venv_python), __file__])

    # Check dependencies (should be installed in venv now)
    if not check_dependencies():
        print_error("Dependencies not installed")
        response = input("\nInstall dependencies now? (y/n): ")
        if response.lower() == 'y':
            if is_in_venv():
                subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            else:
                subprocess.run([sys.executable, "-m", "pip", "install", "--user", "-r", "requirements.txt"])
        else:
            sys.exit(1)

    if not check_env_file():
        print_warning("Please configure .env file with your API keys")
        input("Press Enter when ready...")

    # Start services
    processes = []

    backend = start_backend()
    if backend:
        processes.append(('backend', backend))
    else:
        print_error("Failed to start backend")
        sys.exit(1)

    # Optional: start frontend
    print(f"\n{Colors.BOLD}Start frontend React app?{Colors.ENDC}")
    frontend_choice = input("Type 'y' for yes, or press Enter to skip: ").strip().lower()
    if frontend_choice == 'y':
        frontend = start_frontend()
        if frontend:
            processes.append(('frontend', frontend))

    # Summary
    print_header("Services Running")
    print_success("Backend API: http://localhost:8000")
    print_success("API Docs: http://localhost:8000/docs")

    if len(processes) > 1:
        print_success("Frontend: http://localhost:3000")

    print(f"\n{Colors.BOLD}Browser Extension:{Colors.ENDC}")
    print("1. Open Chrome/Firefox")
    print("2. Go to Extensions page")
    print("3. Enable Developer Mode")
    print("4. Load unpacked: browser-extension/")
    print("5. Join a video call (Google Meet, Zoom, Teams)")
    print("6. Extension will auto-activate!")

    if is_in_venv():
        print(f"\n{Colors.OKGREEN}✓ Running in virtual environment{Colors.ENDC}")
        activate_venv_instructions()

    # Keep running
    print(f"\n{Colors.WARNING}Press Ctrl+C to stop all services{Colors.ENDC}\n")

    try:
        while True:
            time.sleep(1)
            # Check if processes are still running
            for name, proc in processes:
                if proc.poll() is not None:
                    print_error(f"{name} stopped unexpectedly")
    except KeyboardInterrupt:
        print(f"\n{Colors.HEADER}Shutting down...{Colors.ENDC}")
        for name, proc in processes:
            proc.terminate()
            print_success(f"{name} stopped")
        print_success("All services stopped")


if __name__ == "__main__":
    main()
