# Community Submission Portal — Test Cases

Comprehensive test cases for the AgentHub Community Submission Portal, validation logic, bot defense, and moderation lifecycle.

---

## Submission Form Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-SB-01 | Successful Submission | Fill all required fields with valid data, upload valid square PNG logo, complete bot check, click Submit | Form submits successfully (`201 Created`); user redirected to confirmation screen displaying reference ID and 12-hour review SLA notice. |
| TC-SB-02 | Required Field Validation | Attempt to submit form with empty title or missing category | Submission blocked; field highlights with message "This field is required". |
| TC-SB-03 | Summary Character Constraint | Input 130 characters into the summary field | Client validation warns that summary exceeds 120-character limit; submit button disabled. |
| TC-SB-04 | Invalid URL Format | Enter `htp://myagent` in website URL field | Client and server validation error: "Must be a valid HTTPS URL". |
| TC-SB-05 | Invalid Email Format | Enter `invalid-email-string` in maintainer email field | Submission blocked with message "Must be a valid email address". |

---

## Security, Bot Defense & Sanitization Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-SB-SEC01 | Bot Token Validation Failure | Send `POST /api/submissions` with missing or fake Turnstile token | Request rejected with `400 Bad Request` or `403 Forbidden` ("Bot verification failed"). |
| TC-SB-SEC02 | IP Rate Limiting | Trigger 6 submissions within 5 minutes from the same IP address | 6th request is throttled with `429 Too Many Requests`. |
| TC-SB-SEC03 | Markdown XSS Cleansing | Submit `description_markdown` containing `<script>alert('xss')</script>` or `<iframe src="...">` | Stored database record has malicious script and iframe tags stripped completely. |

---

## Asset Upload Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-SB-IMG01 | Valid Brand Logo Upload | Upload 512x512 PNG image under 2MB | Upload accepted; preview rendered in UI; image uploaded to CDN. |
| TC-SB-IMG02 | Oversized File Rejection | Upload an image file exceeding 2MB | Form displays error: "File exceeds 2MB limit". |
| TC-SB-IMG03 | Unsupported Format Rejection | Upload a `.exe` or `.pdf` file disguised as an image | Rejected by MIME type validator: "Only PNG, WebP, and SVG images are supported". |

---

## Moderation Lifecycle Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-SB-MOD01 | Pending State Isolation | Complete valid submission | Database entry created with `lifecycle_state = 'pending'`. Querying public `GET /api/agents` does not return the newly submitted agent. |
| TC-SB-MOD02 | Approval Publishing | Moderator sets `lifecycle_state = 'approved'` | Agent becomes immediately queryable on `GET /api/agents` and visible in directory. |
| TC-SB-MOD03 | Rejection Handling | Moderator sets `lifecycle_state = 'rejected'` | Agent remains unlisted; submitter email notification dispatched with reason. |

