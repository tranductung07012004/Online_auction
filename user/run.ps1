# Stop the script if any error occurs
$ErrorActionPreference = "Stop"

# Check if the environment configuration file (.env) exists
if (-not (Test-Path ".env")) {
    Write-Host ".env not found" -ForegroundColor Red
    exit 1
}

# Load and export variables from .env file
# This mimics 'set -a' and 'source' in Bash
Get-Content .env | Where-Object { $_ -match '=' -and -not $_.StartsWith("#") } | ForEach-Object {
    $name, $value = $_ -split '=', 2
    [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
    # Also set in local scope for the current script to use (like $SERVER_PORT)
    Set-Item "env:\$($name.Trim())" $value.Trim()
}

# Display a status message
Write-Host "Starting main service on port $env:SERVER_PORT"

# Execute the Spring Boot application using the Windows Maven Wrapper
# Note the use of .cmd for Windows
.\mvnw.cmd spring-boot:run