# Spec Delta

## Purpose

Lets people create an account and sign in securely with email and password or with Google, recover access with short-lived single-use codes, and protects these flows against brute force and account enumeration.

## ADDED Requirements

### Requirement: Email and password registration
The system SHALL allow a person to register with an email address and a password. A newly registered account MUST stay inactive until it is activated with an activation code, and an inactive account MUST NOT be able to use any feature that requires sign-in.

#### Scenario: Successful registration
- **WHEN** a person submits a valid email, a valid password, the required consents and a solved CAPTCHA
- **THEN** an inactive account is created
- **AND** a 6-digit activation code is emailed to that address
- **AND** the person is taken to the code entry screen

#### Scenario: Email already registered
- **WHEN** a person registers with an email that already belongs to an account
- **THEN** the response shown is identical to a successful registration
- **AND** no second account is created
- **AND** no information about the existing account is revealed

### Requirement: Password rules
Passwords SHALL be 10 to 128 characters long, MUST NOT equal the email address, and MUST NOT appear in a list of common or breached passwords. The rules MUST be shown next to the password field.

#### Scenario: Password too short
- **WHEN** a person submits a 9-character password
- **THEN** registration is refused with a message stating the minimum length

#### Scenario: Common password
- **WHEN** a person submits a password that is on the common or breached passwords list
- **THEN** registration is refused with a message asking for a less common password

### Requirement: One-time codes
Activation, password reset and email change SHALL use 6-digit numeric codes that are randomly generated, sent by email, bound to a single account and a single purpose, valid for 10 minutes and usable only once.

#### Scenario: Valid code within time
- **WHEN** the person enters the correct code 4 minutes after it was sent
- **THEN** the action for that purpose completes

#### Scenario: Expired code
- **WHEN** the person enters the correct code 11 minutes after it was sent
- **THEN** the code is rejected with a generic invalid-or-expired message

#### Scenario: Code reused
- **WHEN** a code that has already been used is entered again
- **THEN** it is rejected with the same generic message

#### Scenario: Code for another purpose
- **WHEN** a valid activation code is entered in the password reset flow
- **THEN** it is rejected with the same generic message

### Requirement: Only one active code per purpose
Requesting a new code SHALL immediately invalidate any previous code for the same account and purpose.

#### Scenario: New code replaces old
- **WHEN** a person requests a second activation code and then enters the first one
- **THEN** the first code is rejected
- **AND** the second code is accepted

### Requirement: Code resend cooldown
A new code for the same account and purpose SHALL NOT be issued until 60 seconds have passed since the previous one. The interface MUST show a countdown and keep the resend button disabled until it ends.

#### Scenario: Resend too early
- **WHEN** a person requests a new code 30 seconds after the previous one
- **THEN** no code is sent
- **AND** the remaining wait time is shown

#### Scenario: Resend after cooldown
- **WHEN** a person requests a new code 61 seconds after the previous one
- **THEN** a new code is sent and the previous one stops working

### Requirement: Codes are deleted when no longer valid
A code SHALL be permanently removed from storage when it is used, when it is replaced by a new code, when it is invalidated after too many wrong attempts, or when it expires. Codes MUST only ever be stored hashed and MUST never appear in logs.

#### Scenario: Used code is removed
- **WHEN** a code is used successfully
- **THEN** no record of that code remains in storage

#### Scenario: Expired code is removed
- **WHEN** 10 minutes pass after a code was issued without it being used
- **THEN** no record of that code remains in storage

### Requirement: Unactivated accounts expire
An account that has not been activated within 7 days of registration SHALL be deleted automatically.

#### Scenario: Activation never completed
- **WHEN** 7 days pass after registration without activation
- **THEN** the account and its data are deleted and the email can be registered again

### Requirement: Email and password sign-in
The system SHALL sign in an activated account when the correct email and password are provided. Wrong credentials MUST produce a single generic message that does not reveal whether the email exists.

#### Scenario: Correct credentials
- **WHEN** an activated user enters the correct email and password
- **THEN** a session is started and the user lands on the app home screen

#### Scenario: Wrong credentials
- **WHEN** a person enters an unknown email or a wrong password
- **THEN** the message "Email o contraseña incorrectos" is shown in both cases

#### Scenario: Correct credentials on an inactive account
- **WHEN** the correct email and password are entered for an inactive account
- **THEN** the person is taken to the activation code screen with the option to request a new code, subject to the cooldown

### Requirement: Google sign-in
The system SHALL allow signing in and registering with a Google account, retrieving only the name and email. A Google account MUST NOT need a password. On first use an activated account is created after the required consents are accepted.

#### Scenario: First Google sign-in
- **WHEN** a person completes Google sign-in for the first time and accepts the required consents
- **THEN** an activated account is created with the name and email from Google and a session starts

#### Scenario: Email already registered with a password
- **WHEN** a person signs in with Google using the verified email of an existing account
- **THEN** they are signed in to that same account and no duplicate is created

#### Scenario: Google sign-in cancelled
- **WHEN** the person cancels the Google dialog
- **THEN** no account is created and no session starts

### Requirement: Password reset
The system SHALL let a person reset a forgotten password by requesting a reset code by email, entering the code and choosing a new password. The request response MUST be identical whether or not the email belongs to an account.

#### Scenario: Reset for an existing account
- **WHEN** a person requests a reset for a registered email, enters the valid code and a valid new password
- **THEN** the password is changed
- **AND** all other sessions of that account are ended
- **AND** the person is signed in on the current device

#### Scenario: Reset for an unknown email
- **WHEN** a person requests a reset for an email that has no account
- **THEN** the same confirmation message is shown and no email is sent

### Requirement: Session lifetime
A session SHALL remain valid across browser restarts until 30 days without activity or 90 days after sign-in, whichever comes first. After that the user MUST sign in again.

#### Scenario: Inactive for 31 days
- **WHEN** a user returns 31 days after their last activity
- **THEN** they are asked to sign in again

### Requirement: Sign-out
Signing out SHALL end the session on the server so that it can no longer be used from any copy of the session cookie.

#### Scenario: Sign-out
- **WHEN** a user signs out
- **THEN** any further request with the old session cookie is treated as unauthenticated

### Requirement: Wrong password cooldown
After 3 consecutive failed sign-ins for the same email from the same device or IP, a CAPTCHA SHALL be required. After 5 failures within 15 minutes, sign-in for that email from that device and IP MUST be blocked for 15 minutes.

#### Scenario: CAPTCHA after 3 failures
- **WHEN** the third consecutive wrong password is entered for an email
- **THEN** the next attempt requires solving a CAPTCHA

#### Scenario: Cooldown after 5 failures
- **WHEN** the fifth wrong password within 15 minutes is entered
- **THEN** further attempts for that email from that device and IP are refused for 15 minutes with the remaining time shown

#### Scenario: Correct password during cooldown
- **WHEN** the correct password is entered during the cooldown
- **THEN** sign-in is still refused until the cooldown ends

### Requirement: Wrong code attempts
A one-time code SHALL be invalidated and deleted after 5 wrong attempts. The user MUST then request a new code, subject to the resend cooldown.

#### Scenario: Fifth wrong code
- **WHEN** a wrong code is entered for the fifth time
- **THEN** the current code stops working, even if the correct value is entered afterwards
- **AND** the user is told to request a new code

### Requirement: Code request limits
Code requests SHALL be limited to one per 60 seconds per account and purpose, five per hour per account, and twenty per hour per IP.

#### Scenario: Hourly account limit
- **WHEN** a sixth code is requested for the same account within one hour
- **THEN** the request is refused with the time remaining before another code can be requested

### Requirement: CAPTCHA on sensitive forms
Registration and password-reset requests SHALL always require a solved CAPTCHA. The number of registrations per IP and per device MUST be limited to 5 per hour.

#### Scenario: Registration without CAPTCHA
- **WHEN** a registration request arrives without a valid CAPTCHA token
- **THEN** it is refused and no account or email is created

### Requirement: Generic responses
Authentication responses SHALL NOT reveal whether an email is registered, activated or blocked specifically. Cooldown messages MUST be generic, such as "Demasiados intentos. Inténtalo de nuevo en 12 minutos."

#### Scenario: Probing for accounts
- **WHEN** an attacker submits sign-in, registration or reset requests for registered and unregistered emails
- **THEN** the visible responses are indistinguishable
