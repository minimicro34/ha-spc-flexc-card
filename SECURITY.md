# Security Policy

## Supported versions

The latest released version is supported.

Please update to the most recent release before reporting a security issue.

---

## Reporting a vulnerability

If you believe you have found a security vulnerability in **SPC FlexC Card**, please **do not** open a public GitHub issue.

Instead, report it privately by contacting the maintainer through GitHub or by email if a contact address is available.

Please include:

- a description of the vulnerability;
- affected version(s);
- steps to reproduce;
- potential impact;
- any suggested mitigation.

---

## Sensitive information

Never publish or include sensitive Home Assistant or alarm system information in bug reports, issues, pull requests, or discussions.

This includes:

- Home Assistant authentication information
- alarm codes or credentials
- sensitive entity states or attributes
- diagnostics containing security-sensitive information
- any other private authentication or security information

Please remove or redact sensitive information before sharing screenshots, logs, or diagnostics.

---

## Scope

SPC FlexC Card is a Home Assistant Lovelace frontend card for the SPC FlexC integration.

Security reports related to:

- frontend handling of sensitive information;
- unintended exposure of alarm system data;
- arm and disarm action handling;
- confirmation and authorization behavior;
- unsafe interaction with Home Assistant services;

are especially appreciated.

Security issues related to the SPC FlexC protocol, panel communication, authentication, or integration backend should be reported to the **SPC FlexC integration** project instead.

---

Thank you for helping keep SPC FlexC Card secure.