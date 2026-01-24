# Register Test Accounts for Academic Credential Verification System
# This script creates 3 test accounts for demonstration and testing

param(
    [string]$ApiUrl = "http://localhost:5000/api"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Academic Credential System - Test Account Registration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test data for 3 accounts
$accounts = @(
    @{
        name = "Dr. James Smith"
        email = "university@example.com"
        password = "UniPass123!"
        role = "UNIVERSITY_ISSUER"
        organization = "Tech University"
        description = "UNIVERSITY - Issues credentials"
    },
    @{
        name = "Alice Johnson"
        email = "student@example.com"
        password = "StudPass123!"
        role = "STUDENT"
        organization = "Tech University"
        description = "STUDENT - Receives credentials"
    },
    @{
        name = "HR Manager Bob"
        email = "verifier@example.com"
        password = "VerifyPass123!"
        role = "VERIFIER"
        organization = "Acme Corp"
        description = "VERIFIER - Verifies credentials"
    }
)

# Check if backend is reachable
Write-Host "Checking backend connectivity..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$ApiUrl/../health" -Method GET -ErrorAction Stop
    Write-Host "✓ Backend is reachable" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Backend is not reachable at $ApiUrl" -ForegroundColor Red
    Write-Host "Please start the backend first: cd D:\project3\backend; npm start" -ForegroundColor Yellow
    exit 1
}

# Register each account
$registeredAccounts = @()
$failedAccounts = @()

foreach ($account in $accounts) {
    Write-Host "Registering: $($account.description)" -ForegroundColor Cyan
    Write-Host "  Email: $($account.email)" -ForegroundColor Gray
    Write-Host "  Organization: $($account.organization)" -ForegroundColor Gray
    
    $body = @{
        name = $account.name
        email = $account.email
        password = $account.password
        role = $account.role
        organization = $account.organization
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod `
            -Uri "$ApiUrl/auth/register" `
            -Method POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body $body `
            -ErrorAction Stop

        Write-Host "✓ Registration successful!" -ForegroundColor Green
        Write-Host "  User ID: $($response.user.userId)" -ForegroundColor Gray
        Write-Host "  Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host ""
        
        # Store account info for later use
        $registeredAccounts += @{
            description = $account.description
            email = $account.email
            password = $account.password
            userId = $response.user.userId
            token = $response.token
        }
    } catch {
        $errorMsg = $_.Exception.Response.Content | ConvertFrom-Json | Select-Object -ExpandProperty error
        Write-Host "✗ Registration failed: $errorMsg" -ForegroundColor Red
        Write-Host ""
        
        $failedAccounts += $account.description
    }
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Registration Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Successful: $($registeredAccounts.Count) / 3" -ForegroundColor Green
Write-Host "Failed: $($failedAccounts.Count) / 3" -ForegroundColor $(if ($failedAccounts.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failedAccounts.Count -gt 0) {
    Write-Host "Failed accounts:" -ForegroundColor Yellow
    $failedAccounts | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
}

# Display credentials
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Account Credentials" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$accounts | ForEach-Object {
    Write-Host $_.description -ForegroundColor Yellow
    Write-Host "  Email:    $($_.email)" -ForegroundColor White
    Write-Host "  Password: $($_.password)" -ForegroundColor White
    Write-Host "  Role:     $($_.role)" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor Cyan
Write-Host "2. Click 'Register here' or use login if accounts were created" -ForegroundColor Cyan
Write-Host "3. Login with one of the accounts above" -ForegroundColor Cyan
Write-Host "4. Test the workflow:" -ForegroundColor Cyan
Write-Host "   - University: Issue a credential" -ForegroundColor Gray
Write-Host "   - Student: View received credentials" -ForegroundColor Gray
Write-Host "   - Verifier: Verify a credential" -ForegroundColor Gray
Write-Host ""

# Save credentials to file for reference
$outputFile = "D:\project3\test-accounts.txt"
$credentialsText = @"
Academic Credential Verification System - Test Accounts
========================================================
Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Account 1: UNIVERSITY (Issues credentials)
------------------------------------------
Name: Dr. James Smith
Email: university@example.com
Password: UniPass123!
Role: UNIVERSITY_ISSUER
Organization: Tech University

Account 2: STUDENT (Receives credentials)
------------------------------------------
Name: Alice Johnson
Email: student@example.com
Password: StudPass123!
Role: STUDENT
Organization: Tech University

Account 3: VERIFIER (Verifies credentials)
------------------------------------------
Name: HR Manager Bob
Email: verifier@example.com
Password: VerifyPass123!
Role: VERIFIER
Organization: Acme Corp

Website: http://localhost:3000
Backend API: http://localhost:5000
"@

$credentialsText | Out-File -FilePath $outputFile -Encoding UTF8 -Force
Write-Host "Credentials saved to: $outputFile" -ForegroundColor Green
Write-Host ""
