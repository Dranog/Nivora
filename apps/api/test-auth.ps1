# Auth Module Security Test Suite
$API_URL = "http://localhost:3001/api/auth"
$Passed = 0
$Failed = 0
$Total = 0

function Test-Result {
    param($Name, $Success, $Details = "")
    $script:Total++
    if ($Success) {
        $script:Passed++
        Write-Host "✓ $Name" -ForegroundColor Green
    } else {
        $script:Failed++
        Write-Host "✗ $Name" -ForegroundColor Red
    }
    if ($Details) {
        Write-Host "  $Details" -ForegroundColor Cyan
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  AUTH MODULE SECURITY TEST SUITE                           ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Blue

# TEST 1: Register with weak password
Write-Host "=== TEST 1: Register with weak password (should fail) ===" -ForegroundColor Yellow
try {
    $body = @{
        email = "test@example.com"
        password = "weak123"
        passwordConfirm = "weak123"
        role = "FAN"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$API_URL/register" -Method POST `
        -Body $body -ContentType "application/json" -ErrorAction Stop
    Test-Result "Weak password validation" $false "Expected 400, got: $($response.StatusCode)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $content = $_.ErrorDetails.Message | ConvertFrom-Json
    $passed = ($statusCode -eq 400) -and ($content.message -like "*Password*")
    Test-Result "Weak password validation" $passed "Status: $statusCode"
}

Start-Sleep -Milliseconds 200

# TEST 2: Register with strong password
Write-Host "`n=== TEST 2: Register with strong password (should succeed) ===" -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$testEmail = "testuser$timestamp@example.com"

try {
    $body = @{
        email = $testEmail
        password = "StrongPass123!"
        passwordConfirm = "StrongPass123!"
        role = "FAN"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$API_URL/register" -Method POST `
        -Body $body -ContentType "application/json"
    $data = $response.Content | ConvertFrom-Json
    $passed = ($response.StatusCode -eq 201) -and $data.accessToken
    Test-Result "Strong password registration" $passed "Status: $($response.StatusCode), Email: $testEmail"

    $script:testUser = @{
        email = $testEmail
        password = "StrongPass123!"
        tokens = $data
    }
} catch {
    Test-Result "Strong password registration" $false $_.Exception.Message
}

Start-Sleep -Milliseconds 200

# TEST 3: Login with correct password
Write-Host "`n=== TEST 3: Login with correct password (should succeed) ===" -ForegroundColor Yellow
if ($script:testUser) {
    try {
        $body = @{
            email = $script:testUser.email
            password = $script:testUser.password
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "$API_URL/login" -Method POST `
            -Body $body -ContentType "application/json"
        $data = $response.Content | ConvertFrom-Json
        $passed = ($response.StatusCode -eq 200) -and $data.accessToken
        Test-Result "Successful login" $passed "Status: $($response.StatusCode)"

        $script:testUser.loginTokens = $data
    } catch {
        Test-Result "Successful login" $false $_.Exception.Message
    }
} else {
    Test-Result "Successful login" $false "No test user available"
}

Start-Sleep -Milliseconds 200

# TEST 4: Login with wrong password
Write-Host "`n=== TEST 4: Login with wrong password (should fail) ===" -ForegroundColor Yellow
if ($script:testUser) {
    try {
        $body = @{
            email = $script:testUser.email
            password = "WrongPassword123!"
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "$API_URL/login" -Method POST `
            -Body $body -ContentType "application/json" -ErrorAction Stop
        Test-Result "Wrong password rejected" $false "Expected 401, got: $($response.StatusCode)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $content = $_.ErrorDetails.Message | ConvertFrom-Json
        $passed = ($statusCode -eq 401) -and ($content.error -eq "InvalidCredentials")
        Test-Result "Wrong password rejected" $passed "Status: $statusCode, Error: $($content.error)"
    }
} else {
    Test-Result "Wrong password rejected" $false "No test user available"
}

Start-Sleep -Milliseconds 200

# TEST 5: Account lockout
Write-Host "`n=== TEST 5: Account lockout after 10 failed attempts ===" -ForegroundColor Yellow
$lockoutTimestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$lockoutEmail = "lockouttest$lockoutTimestamp@example.com"

try {
    # Register lockout test user
    $body = @{
        email = $lockoutEmail
        password = "LockoutTest123!"
        passwordConfirm = "LockoutTest123!"
        role = "FAN"
    } | ConvertTo-Json

    $registerResp = Invoke-WebRequest -Uri "$API_URL/register" -Method POST `
        -Body $body -ContentType "application/json"

    if ($registerResp.StatusCode -eq 201) {
        Write-Host "  Making 10 failed login attempts..." -ForegroundColor Cyan

        # Make 10 failed attempts
        for ($i = 1; $i -le 10; $i++) {
            $failBody = @{
                email = $lockoutEmail
                password = "WrongPassword!"
            } | ConvertTo-Json

            try {
                Invoke-WebRequest -Uri "$API_URL/login" -Method POST `
                    -Body $failBody -ContentType "application/json" -ErrorAction Stop | Out-Null
            } catch {
                # Expected to fail
            }
            Write-Host "  Attempt $i/10" -ForegroundColor Cyan
            Start-Sleep -Milliseconds 150
        }

        # Try 11th attempt - should be locked
        try {
            $failBody = @{
                email = $lockoutEmail
                password = "WrongPassword!"
            } | ConvertTo-Json

            $response = Invoke-WebRequest -Uri "$API_URL/login" -Method POST `
                -Body $failBody -ContentType "application/json" -ErrorAction Stop
            Test-Result "Account locked after 10 attempts" $false "Expected 403, got: $($response.StatusCode)"
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $content = $_.ErrorDetails.Message | ConvertFrom-Json
            $passed = ($statusCode -eq 403) -and ($content.error -eq "AccountLocked")
            Test-Result "Account locked after 10 attempts" $passed "Status: $statusCode, Error: $($content.error)"
        }
    }
} catch {
    Test-Result "Account lockout test" $false $_.Exception.Message
}

Start-Sleep -Milliseconds 200

# TEST 6: Token refresh
Write-Host "`n=== TEST 6: Token refresh with valid token (should succeed) ===" -ForegroundColor Yellow
if ($script:testUser.loginTokens.refreshToken) {
    try {
        $body = @{
            refreshToken = $script:testUser.loginTokens.refreshToken
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "$API_URL/refresh" -Method POST `
            -Body $body -ContentType "application/json"
        $data = $response.Content | ConvertFrom-Json
        $passed = ($response.StatusCode -eq 200) -and $data.accessToken
        Test-Result "Token refresh successful" $passed "Status: $($response.StatusCode)"

        $script:testUser.oldRefreshToken = $script:testUser.loginTokens.refreshToken
        $script:testUser.newTokens = $data
    } catch {
        Test-Result "Token refresh successful" $false $_.Exception.Message
    }
} else {
    Test-Result "Token refresh" $false "No refresh token available"
}

Start-Sleep -Milliseconds 200

# TEST 7: Blacklisted token reuse
Write-Host "`n=== TEST 7: Reuse blacklisted refresh token (should fail) ===" -ForegroundColor Yellow
if ($script:testUser.oldRefreshToken) {
    try {
        $body = @{
            refreshToken = $script:testUser.oldRefreshToken
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "$API_URL/refresh" -Method POST `
            -Body $body -ContentType "application/json" -ErrorAction Stop
        Test-Result "Blacklisted token rejected" $false "Expected 401, got: $($response.StatusCode)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $content = $_.ErrorDetails.Message | ConvertFrom-Json
        $passed = ($statusCode -eq 401) -and ($content.error -eq "InvalidRefreshToken")
        Test-Result "Blacklisted token rejected" $passed "Status: $statusCode, Error: $($content.error)"
    }
} else {
    Test-Result "Blacklisted token reuse" $false "No old refresh token available"
}

Start-Sleep -Milliseconds 200

# TEST 8: Logout
Write-Host "`n=== TEST 8: Logout (should succeed) ===" -ForegroundColor Yellow
if ($script:testUser.newTokens.accessToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $($script:testUser.newTokens.accessToken)"
        }

        $response = Invoke-WebRequest -Uri "$API_URL/logout" -Method POST `
            -Headers $headers -ContentType "application/json"
        $data = $response.Content | ConvertFrom-Json
        $passed = ($response.StatusCode -eq 200) -and ($data.success -eq $true)
        Test-Result "Logout successful" $passed "Status: $($response.StatusCode)"
    } catch {
        Test-Result "Logout successful" $false $_.Exception.Message
    }
} else {
    Test-Result "Logout" $false "No access token available"
}

Start-Sleep -Milliseconds 200

# TEST 9: Rate limiting
Write-Host "`n=== TEST 9: Rate limiting (should throttle after limit) ===" -ForegroundColor Yellow
Write-Host "  Making 4 rapid register attempts (limit is 3/min)..." -ForegroundColor Cyan

$rateLimitPassed = $false
for ($i = 1; $i -le 4; $i++) {
    $ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    try {
        $body = @{
            email = "ratelimit$ts$i@example.com"
            password = "RateLimit123!"
            passwordConfirm = "RateLimit123!"
            role = "FAN"
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "$API_URL/register" -Method POST `
            -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "  Attempt $i: $($response.StatusCode)" -ForegroundColor Cyan
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  Attempt $i: $statusCode" -ForegroundColor Cyan
        if ($i -eq 4 -and $statusCode -eq 429) {
            $rateLimitPassed = $true
        }
    }
}

Test-Result "Rate limiting enforced" $rateLimitPassed "4th attempt status should be 429"

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  TEST RESULTS SUMMARY                                      ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host "Total Tests: $Total" -ForegroundColor Cyan
Write-Host "Passed: $Passed" -ForegroundColor Green
if ($Failed -gt 0) {
    Write-Host "Failed: $Failed" -ForegroundColor Red
} else {
    Write-Host "Failed: $Failed" -ForegroundColor Green
}
$percent = [math]::Round(($Passed / $Total) * 100, 1)
Write-Host "Success Rate: $percent%`n" -ForegroundColor Cyan

# Database verification
Write-Host "=== DATABASE VERIFICATION ===" -ForegroundColor Blue
Write-Host "Run these queries to verify:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Check audit logs:" -ForegroundColor Yellow
Write-Host '   SELECT event, "userId", "createdAt" FROM audit_logs ORDER BY "createdAt" DESC LIMIT 20;' -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Check user lockout fields:" -ForegroundColor Yellow
Write-Host '   SELECT email, status, "failedLoginAttempts", "lockedUntil" FROM users WHERE email LIKE ''%lockouttest%'';' -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Check sessions:" -ForegroundColor Yellow
Write-Host '   SELECT "userId", jti, "expiresAt" FROM sessions ORDER BY "createdAt" DESC LIMIT 10;' -ForegroundColor Cyan
Write-Host ""

if ($Failed -eq 0) {
    exit 0
} else {
    exit 1
}
