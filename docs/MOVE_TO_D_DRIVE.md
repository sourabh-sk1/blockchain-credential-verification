MOVE TO D: DRIVE - Full Configuration & Migration Guide

This document shows how to configure development tools and move projects to the D: drive on Windows so all caches, global installs, data directories and project files live on D:. It includes step-by-step commands and tips.

Summary of actions covered
- Change npm global folder and cache to D:
- Change Docker image/container/volume storage to D:
- Choose a default Git clone location on D:\ and move existing repositories
- Place Hyperledger Fabric network and crypto material on D:\ and configure env variables
- Configure VS Code workspace/folders to use D:\
- Move an existing project from C:\ to D:\ without breaking configuration
- Update project run commands to use D:\project3

Important notes
- Always back up critical data before moving or reconfiguring services.
- Some system-wide installers (Node, Docker Desktop) still default to C:, but their runtime/cache/data can be redirected to D:.
- You must run PowerShell as Administrator for some operations (changing Docker daemon config, moving Docker data, stopping services).

1) Recommended folder layout on D:

D:\projects\project3         # Your project root
D:\nodejs\                  # Optional: custom Node.js installation folder
D:\npm-global\              # npm global packages & binaries
D:\npm-cache\               # npm cache
D:\pip-cache\               # pip cache (Python)
D:\docker\                  # Docker data-root (images, containers)
D:\fabric\                  # Hyperledger Fabric artifacts (crypto material, config)
D:\vscode\workspaces\      # VS Code saved workspaces (optional)


2) Moving the project from C: to D:

Pre-check: close editors and stop running services
- Stop Node servers, Docker containers, and related services before moving files.

PowerShell commands (recommended: run as Administrator):
```powershell
# Create destination folder
New-Item -ItemType Directory -Path D:\projects\ -Force

# Use Robocopy to preserve attributes and permissions
robocopy C:\path\to\existing\project D:\projects\project3 /MIR /COPYALL /Z /R:3 /W:5

# Verify files copied
Get-ChildItem -Recurse D:\projects\project3 | Select-Object -First 20

# Remove old files on C: only when you are sure everything works
# Be careful: only delete if you're certain
# robocopy with /MIR is destructive on the destination; do not run it backwards
# Optional: after verifying, you can remove the original
# Remove-Item -Recurse -Force C:\path\to\existing\project
```

Update any absolute paths in configuration files
- Search for `C:\` occurrences inside project and config files and update them to `D:\projects\project3` or use relative paths.

PowerShell search example:
```powershell
Select-String -Path D:\projects\project3\**\* -Pattern "C:\\" -SimpleMatch -List
```

If you used `docker-compose` with volume mounts pointing to C:, update them in `docker-compose.yml`.

3) Change npm global folder to D:

This moves global packages and their binaries (e.g., CLI tools) to D:\npm-global and adds it to the PATH.

PowerShell commands:
```powershell
# Create folder
New-Item -ItemType Directory -Path D:\npm-global -Force

# Configure npm to use the new prefix
npm config set prefix "D:\npm-global"

# Configure npm cache folder
npm config set cache "D:\npm-cache" --global

# Add D:\npm-global to user PATH (persist across sessions)
$oldPath = [Environment]::GetEnvironmentVariable('Path',[EnvironmentVariableTarget]::User)
$newPath = "$oldPath;D:\npm-global\bin"
[Environment]::SetEnvironmentVariable('Path', $newPath, [EnvironmentVariableTarget]::User)

# Verify
npm config get prefix
npm config get cache
```

Notes:
- On Windows, global bins may be in `D:\npm-global\` without a `bin` folder; add the correct folder per your layout.
- After updating PATH, restart PowerShell or log out/in.

4) Change npm default cache and tmp directories (optional)

```powershell
npm config set cache "D:\npm-cache"
npm config set tmp "D:\npm-tmp"
```

5) Change Docker storage (images, containers, volumes) to D:\docker

Option A — Docker Desktop (Windows) - Recommended
- Open Docker Desktop > Settings > Resources > Advanced (or Disk image location) and change the Docker disk image location to `D:\docker` (UI may show "Disk image location" or "Move disk image").
- Use "Move disk image" to relocate existing images/containers to the new path.
- Restart Docker Desktop when prompted.

Option B — Docker Engine (daemon.json) (for Docker on Windows Server or Docker Engine)
1. Stop Docker service (run PowerShell as Admin):
```powershell
Stop-Service docker
```
2. Create or edit `C:\ProgramData\Docker\config\daemon.json` and add `data-root` pointing to D:\docker (ensure folder exists):
```json
{
  "data-root": "D:\\docker",
  "storage-driver": "windowsfilter"
}
```
3. Move existing data (if present) from `C:\ProgramData\Docker` to new folder (careful — backup first):
```powershell
# Ensure Docker is stopped
robocopy C:\ProgramData\Docker D:\docker /E /COPYALL /R:3 /W:5
```
4. Start Docker service:
```powershell
Start-Service docker
```

Notes:
- Docker Desktop often uses its own VM (WSL2) disk image; UI method is safer.
- Moving Docker data requires enough free space on D: and administrative rights.

6) Change Git clone default location / common practice

Git does not have a global "default clone path" — you choose where to clone. Recommended workflow:

```powershell
# Create a projects folder on D:
New-Item -ItemType Directory -Path D:\projects -Force

# Clone to D:\projects\project3
git clone <repo-url> D:\projects\project3

# Or set up a PowerShell alias/function to cd into D:\projects and clone there by default
function gclone($url, $name) { Set-Location D:\projects; git clone $url $name }
```

7) Configure Hyperledger Fabric files to use D:\fabric

Move Fabric config and crypto material to D:\fabric and set environment variables.

```powershell
# Example: copy local fabric folder
New-Item -ItemType Directory -Path D:\fabric -Force
robocopy D:\project3\blockchain\hyperledger-fabric D:\fabric /E /COPYALL

# Set environment variables for Fabric CLI usage (temporary for session)
$env:FABRIC_CFG_PATH = 'D:\fabric'
$env:CORE_PEER_MSPCONFIGPATH = 'D:\fabric\crypto-config\peerOrganizations\org1.example.com\users\Admin@org1.example.com\msp'
$env:CORE_PEER_ADDRESS = 'localhost:7051'

# Persist them (optional)
setx FABRIC_CFG_PATH "D:\fabric"
setx CORE_PEER_MSPCONFIGPATH "D:\fabric\crypto-config\peerOrganizations\org1.example.com\users\Admin@org1.example.com\msp"
```

8) Change VS Code workspace folder to D:\

- Move workspace files and projects to `D:\vscode\workspaces` or `D:\projects`.
- In VS Code: File > Open Folder > select `D:\projects\project3`.
- To change default "Open Folder" behavior, you can create a Windows shortcut to open VS Code with a folder:
```powershell
code D:\projects\project3
```
- To persist workspace settings, save a workspace file `D:\vscode\workspaces\project3.code-workspace` and open that.

9) Python pip cache and virtualenvs on D:\

Set pip cache and configure virtualenvs to live on D:\
```powershell
# pip cache
pip cache dir
# set PIP_CACHE_DIR in PowerShell session
$env:PIP_CACHE_DIR = 'D:\pip-cache'
setx PIP_CACHE_DIR 'D:\pip-cache'

# create virtualenvs on D:\
python -m venv D:\venvs\project3-venv
```

10) Update environment variables and system PATHs

Use `setx` to set persistent user-level environment variables. Example:
```powershell
setx NPM_CONFIG_PREFIX "D:\npm-global"
setx NODE_PATH "D:\nodejs\node_modules"
setx FABRIC_CFG_PATH "D:\fabric"
```

Log out and log back in (or restart PowerShell) to pick up user PATH changes.

11) Running the project entirely from D:\ (final run commands)

```powershell
# Ensure Docker is using D:\docker for data (see earlier steps)
# Start Docker (if using Docker Desktop) and verify it's healthy

# Start MongoDB container (data will be stored in Docker data-root on D:)
docker run -d `
  -e MONGO_INITDB_ROOT_USERNAME=admin `
  -e MONGO_INITDB_ROOT_PASSWORD=password123 `
  -p 27017:27017 `
  --name credential-mongodb `
  mongo:6.0

# Backend
Set-Location D:\projects\project3\backend
npm install
npm run dev

# Frontend
Set-Location D:\projects\project3\frontend
npm install --legacy-peer-deps
npm start

# Or run everything with docker-compose from D:\projects\project3\docker
Set-Location D:\projects\project3\docker
docker-compose up -d
```

12) Notes about global installers (Node, Docker Desktop)
- Node.js installer typically writes to `C:\Program Files\nodejs`. You can install Node manually by downloading the Windows binary and extracting to `D:\nodejs` and adding `D:\nodejs` to PATH.
- Docker Desktop installer defaults to C:\ but uses a disk image which can be moved via Docker Desktop UI.

13) Troubleshooting tips
- If a service still references `C:\`, search project and config files for `C:\` and update references.
- Restart machine after changing service-level settings (Docker daemon changes).
- Verify free space on D:\ before moving large Docker data (images/volumes).

14) Automation script (optional)
- You can write a PowerShell script to perform the common steps (set npm prefix, create folders, move project). Use with care.

---

If you'd like, I can:
- Generate a PowerShell script that automates the most common steps (create folders, set npm prefix, set PATH, copy project),
- Apply `D:\` absolute paths to other project docs (README.md), or
- Help migrate Docker data with careful backup and verification.

Please tell me whether you want the PowerShell automation script and whether it's okay to perform file moves here now.
