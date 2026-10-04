# Spec Delta

## Purpose

Sends the app's transactional emails from the owner's domain within the email provider's free-tier limits. It protects the sending budget and the domain's reputation against bots, abuse and undeliverable addresses, while keeping account recovery available.

## ADDED Requirements

### Requirement: Authenticated sender
All emails SHALL be sent from `no-reply@safebaites.isaacgarcia.stream` with the display name "safeBAItes", and MUST pass SPF, DKIM and DMARC. The DKIM signature MUST use the sender's exact domain.

#### Scenario: Authentication results
- **WHEN** an activation email arrives in a Gmail inbox
- **THEN** its authentication results show spf=pass, dkim=pass with `d=safebaites.isaacgarcia.stream`, and dmarc=pass

### Requirement: EU processing
Emails SHALL be sent through the email provider's EU region, so recipient addresses and message content are processed in the EU.

#### Scenario: Sending region
- **WHEN** the sending domain's configuration at the provider is inspected
- **THEN** its region is the EU region

### Requirement: Staged DMARC policy
The domain's DMARC policy SHALL move from monitoring (`p=none`), to `quarantine`, to `reject`, for the domain and all its subdomains. A stage MUST only advance after aggregate reports show, for 14 consecutive days, at least 99% of the app's messages passing DMARC and every sending source identified. If legitimate mail fails, the policy MUST go back one stage.

#### Scenario: Not ready to advance
- **WHEN** the reports of the last 14 days show 97% of the app's messages passing DMARC
- **THEN** the policy stays at its current stage

#### Scenario: Legitimate mail failing after a change
- **WHEN** reports under `quarantine` show legitimate messages from the app failing DMARC
- **THEN** the policy returns to `p=none` until the cause is fixed and a new 14-day window passes

### Requirement: Enforced DMARC
Within 8 weeks of the first production email, the published policy SHALL be `p=reject` with `sp=reject`. From then on, receivers that honour DMARC MUST reject mail that claims to come from the domain or any of its subdomains and fails DMARC.

#### Scenario: Final policy
- **WHEN** the domain's DMARC record is looked up 8 weeks after launch
- **THEN** it contains `p=reject` and `sp=reject`

#### Scenario: Spoofed email
- **WHEN** a message claiming to be from `no-reply@safebaites.isaacgarcia.stream` is sent to a Gmail address from an unauthorised server
- **THEN** Gmail rejects it

### Requirement: Allowed email types
The app SHALL send only four types of email:
- Activation codes.
- Password reset codes.
- Email change codes.
- The email-changed notice to the previous address.

Moderation results and all other notifications MUST be in-app only.

#### Scenario: Moderation decision
- **WHEN** an admin removes a user's recipe
- **THEN** the author is notified in the app and no email is sent

### Requirement: Fixed email content
Email templates SHALL contain no user-supplied text such as name, alias or recipe content. Only the code, its expiry and fixed text in the user's language appear. Emails MUST be plain text plus simple HTML, with no remote images and no open or click tracking.

#### Scenario: Name containing a link
- **WHEN** a person signs in with Google using a name that contains a URL
- **THEN** no email sent to them contains that name or URL

### Requirement: Global daily budget with recovery reserve
In any rolling 24 hours the app SHALL send at most 95 emails. Activation emails MUST stop at 80, so the remaining 15 stay reserved for password reset codes, email change codes and email-changed notices.

#### Scenario: Activation share used up
- **WHEN** 80 activation emails have been sent in the last 24 hours and a person registers
- **THEN** no account is created
- **AND** the person sees "El registro no está disponible temporalmente, inténtalo más tarde"

#### Scenario: Reset still possible
- **WHEN** activation emails are capped but fewer than 95 emails were sent in 24 hours
- **THEN** a password reset code can still be sent

#### Scenario: Daily budget exhausted
- **WHEN** 95 emails have been sent in the last 24 hours
- **THEN** further email-triggering requests are refused with a generic temporary-unavailability message and nothing is sent

### Requirement: Monthly budget
In a calendar month (UTC) the app SHALL send at most 2,950 emails. Activation emails MUST stop at 2,700, so the rest stays reserved for recovery emails.

#### Scenario: Monthly activation cap
- **WHEN** 2,700 activation emails have been sent this month
- **THEN** registration is temporarily unavailable until the next month while recovery emails continue within the cap

### Requirement: Per-mailbox limits
The app SHALL send at most 3 emails per hour and 6 per 24 hours to the same mailbox. Addresses that differ only in capitalisation or a "+tag" suffix, or for Gmail in dots, MUST count as the same mailbox. Refusals use the same generic messages as other code limits.

#### Scenario: Alias variants counted together
- **WHEN** codes are requested for "Ana+1@gmail.com", "a.na@gmail.com" and "ana@googlemail.com" within one hour
- **THEN** they count as 3 emails to the same mailbox and a fourth request within the hour is refused

### Requirement: Per-IP email limit
In addition to the other limits, an IP SHALL be able to trigger at most 10 emails per 24 hours.

#### Scenario: Eleventh email request
- **WHEN** an IP triggers its eleventh email within 24 hours
- **THEN** no email is sent and the generic limit message is shown

### Requirement: Address quality checks
On registration and email change the address SHALL be rejected, without sending anything, if:
- its syntax is invalid or it is longer than 254 characters;
- its domain is on the disposable-email list;
- its domain has no mail server.

#### Scenario: Disposable address
- **WHEN** a person registers with an address from a disposable-email domain
- **THEN** registration is refused with "Introduce una dirección de email válida y permanente" and no email is sent

#### Scenario: Domain without mail server
- **WHEN** a person registers with an address whose domain has no MX or address record
- **THEN** registration is refused with the same message

### Requirement: Bot filtering on email-triggering forms
Registration, code resend, password reset and email change SHALL each require a solved CAPTCHA. A submission is silently discarded, with the normal response and no email, if:
- it fills the hidden honeypot field; or
- it arrives less than 2 seconds after the form was issued, or with no valid form token.

#### Scenario: Honeypot filled
- **WHEN** a registration arrives with the hidden field filled
- **THEN** the usual response is shown, no account is created and no email is sent

#### Scenario: Instant submission
- **WHEN** a password reset request arrives 0.5 seconds after its form was issued
- **THEN** the usual response is shown and no email is sent

### Requirement: Bounce and complaint suppression
When the provider reports a hard bounce or a spam complaint for an address, it SHALL be suppressed: no further emails are sent to it until an admin clears it. Provider notifications MUST be accepted only with a valid signature and a recent timestamp, and each notification is processed only once.

#### Scenario: Hard bounce
- **WHEN** the provider reports a hard bounce for an address and the user then requests a new code
- **THEN** no email is sent and the user sees the generic response with a hint to check the address

#### Scenario: Forged notification
- **WHEN** a bounce notification arrives with an invalid signature
- **THEN** it is rejected with HTTP 401 and no address is suppressed

#### Scenario: Replayed notification
- **WHEN** the same valid notification is delivered twice
- **THEN** it is processed only once

### Requirement: Send failure recovery
If an email cannot be sent after 3 attempts within 30 seconds, the code issued for it SHALL be deleted and the resend cooldown released. The user MUST be told the email could not be sent and asked to try again. The failed email does not count against any limit or budget.

#### Scenario: Provider unavailable
- **WHEN** the email provider fails three times while sending an activation code
- **THEN** the code is deleted, the user can request a new code immediately, and the budgets are unchanged

### Requirement: Provider limit circuit breaker
If the provider answers with a quota or rate-limit error, sending SHALL pause until the provider's window resets. During the pause, requests behave as if the budget were exhausted.

#### Scenario: Provider quota reached
- **WHEN** the provider returns a daily-quota error
- **THEN** no further send attempts are made until the window resets and users see the temporary-unavailability message

### Requirement: Email usage monitoring
The admin back office SHALL show:
- Emails sent in the last 24 hours and this month, by type, and the remaining budgets.
- The number of suppressed addresses.

When 80% of either budget is used, a warning MUST be shown to admins and logged.

#### Scenario: 80% warning
- **WHEN** 76 emails have been sent in the last 24 hours
- **THEN** admins see a budget warning in the back office

### Requirement: Privacy of the send log
Each send attempt SHALL be logged with type, time, status, provider message ID and a hash of the recipient mailbox. The code and the plain address MUST never be logged. The log is kept for 30 days.

#### Scenario: Log contents
- **WHEN** the send log is inspected after an activation email
- **THEN** it contains a hashed mailbox, the type and the status, but neither the code nor the address

### Requirement: Contact mailbox
The contact address published in the legal notice, `contacto@isaacgarcia.stream`, SHALL receive email and forward it to the operator. Every email MUST state that replies to the no-reply address are not read and point to the contact address.

#### Scenario: Message to the contact address
- **WHEN** someone emails `contacto@isaacgarcia.stream`
- **THEN** the message reaches the operator's inbox
