# Offline-by-default Modbux for controlled OT tests

This fork retains Modbux's GUI and its **manual** Client and Server capabilities. The changes in this branch reduce **unsolicited** traffic; they do **not** turn Modbux into a read-only application or certify it for unsupervised production use.

## What changed

- Removed the automatic renderer-side check of `https://api.github.com/repos/ploxc/modbux/releases/latest` and its update banner. The Home screen's optional website/repository links remain available when clicked.
- Removed the GitHub API exception from the renderer Content Security Policy. The packaged UI no longer needs an external HTTP(S) endpoint. Its `connect-src 'self'` permits same-origin requests (including the development server), not arbitrary web connections.
- Deferred Modbus Server initialization until a user opens **Server**. Ordinary application launch, Home, and **Client** no longer invoke the server setup path that binds an incoming TCP listener. Split-out Server mode still initializes its own view.
- Kept the entire Modbus client GUI (including **Read**, **Write**, **Poll**, unit-ID and register **Scan**) and the manually initiated Server GUI. This is **not** a safety interlock preventing Modbus writes.

## Expected network behavior

| Activity | Expected behavior |
| --- | --- |
| Launch app / open Home | No application-initiated GitHub release check and no automatic Modbus server listener |
| Open Client without connecting | No intentional Modbus TCP connection |
| Connect as Client to a specified host | TCP connection to that configured host/port; the client can automatically reconnect on lost connections |
| Manually poll/read/scan/write | Modbus requests to the configured target, including write requests if the user selects Write |
| Open Server, including in a separate window | **Intentionally** starts Modbus TCP/RTU server per stored server settings, potentially listening on `0.0.0.0` |
| Click external GitHub/developer links | Opens the default browser; this is user-initiated external network access |
| Save client/server configuration | Locally persisted data, including addresses and register maps; not automatically uploaded by this branch |

**Important:** Changing views after explicitly opening Server does not necessarily stop an active server listener. The new behavior prevents *unrequested startup* of Server; it does not remove the Server feature or guarantee the absence of listeners after the user starts one.

## Pre-line acceptance test (separate from production equipment)

On an approved, isolated test Mac (no OT connections):

1. Build the branch and inspect software supply-chain inputs before installing dependencies or running any install scripts. The code and `yarn.lock` are public; they and the packaged binary have **not** been exhaustively audited for vulnerabilities.
2. Launch the **packaged** app, stay on Home and enter Client. Verify no unsolicited HTTPS requests and no Modbux-owned listening TCP ports with host firewall/process tools. Restart and repeat with prior client/server settings saved to local storage.
3. Open **Server** intentionally; confirm its listening port appears, its GUI works and remains usable. Quit fully and verify it closes.
4. Exercise manual Client Read, Poll, configuration save/load, and a simulator only in a separate isolated environment. Confirm the GUI still works. **Never exercise writes/scans against a production machine without a separate authorization.**
5. With an independent firewall/packet monitor, confirm the only successful traffic in the controlled Client test is to the **explicitly selected simulator host**. Verify the automatic update check never fires.
6. Repeat after packaging on the intended Apple Silicon Mac; tests of development mode are not evidence that the shipped `.dmg` behaves the same.

Review the existing source and packaged artifacts separately. There is **no independent binary network-capture report or macOS runtime attestation** accompanying this PR.

## Production handling

- Do not connect the Mac to any production equipment without separate written authorization from Operations, Maintenance and IT. Maintenance must verify the intended external data port; a spare connector can be internally switched to a broader OT network.
- IT should provide the machine address, approved laptop address/subnet, and an effective firewall configuration. Wi-Fi/VPN off and no default router reduce internet access, but are **not** proof of isolation from every reachable OT peer.
- Restrict access to the approved Modbus TCP endpoint; use **Client → Read once** for the initial status and counter comparison. Avoid `Write`, `Poll`, `Scan` and **Server** during the initial verification.
- If it is essential to enforce *read-only* traffic, use a separate purpose-built client or an IT-managed gateway/firewall that permits only authorized read functions. This full GUI intentionally still includes write functionality.
- Keep addresses, logs and exports on an IT-approved local drive, not in cloud-synced folders or GitHub. Use only redacted evidence when sharing results.

## Limitations

The change blocks the **identified** application-level background GitHub request and automatic Server startup. A restrictive renderer CSP is defense in depth but does **not** constrain the main process, OS, dependencies, manually opened external browser, or direct Node TCP connections. No static review can promise that the application or a published binary will **never** connect to an external endpoint. An independent test of the packaged application and IT network restrictions remain necessary.

## Register text preview

The Client results table includes **Text (ASCII)** beside **HEX** for holding and input registers, without changing the selected data type. Each row decodes its own two bytes in the same order as HEX: `4849` shows `HI`. Spaces are preserved; non-printable and non-ASCII bytes are shown as `\xNN` (for example, `4100` shows `A\x00`). Literal backslashes are doubled to distinguish them from byte escapes. Failed reads leave this preview blank.

This is a read-only display conversion and sends no additional requests. It does not infer that a numeric register is text, join adjacent registers, or apply the numeric 32/64-bit word-order setting. For a model name or other longer string, select the existing `utf8` data type at its starting register and configure the intended read range. Confirm the device's text encoding and byte order against its register documentation before interpreting the result.
