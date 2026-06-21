## lfw_pcap_test – Offline lfw tester

`lfw_pcap_test` is a small helper tool that lets you run the **same rule engine and config** as the main `lfw` daemon, but against packets stored in a **pcap file** instead of live eBPF/TC traffic.

### Build

From the project root:

```bash
make pcap-test
```

This produces:

- `build/lfw_pcap_test`

### Usage

```bash
./build/lfw_pcap_test <file.pcap|file.pcapng> [rules_file]
```

- **`<file.pcap|file.pcapng>`**: required; the packet capture file to replay.
- **`[rules_file]`**: optional path to an lfw rules file.
  - If omitted, defaults to `/etc/lfw/lfw.rules` (same as the main daemon).

Examples:

```bash
# Use system rules (/etc/lfw/lfw.rules)
./build/lfw_pcap_test wireshark_packet_capture.pcapng

# Use a custom rules file in the repo
./build/lfw_pcap_test wireshark_packet_capture.pcapng ./lfw.rules
```

### Behaviour

- Rules and default policy are loaded via `lfw_config_load_file`, just like `src/main.c`.
- If the rules file cannot be loaded, the tool falls back to:
  - **empty ruleset**
  - **default action = DROP** (deny all inbound), same as the daemon’s failure behaviour.
- For each IPv4 or IPv6 packet in the pcap:
  - The tool skips the link-layer header (Ethernet/Linux Cooked Capture SLL).
  - Parses the packet using `lfw_parse_packet(..., LFW_DIR_INBOUND, ...)`.
  - Evaluates it with `lfw_engine_evaluate`.
  - Prints a formatted log entry for each evaluation:

```text
[lfw] ALLOW in  udp    10.63.143.120:59081 ->  139.84.142.141:123   (NEW)
[lfw] DENY  in  tcp    10.63.143.120:53968 ->         8.8.8.8:853   [AP]
[lfw] ALLOW in  tcp  2409:40e4:2b:8008:7213:3f8f:555e:fec9:53046 -> 2404:6800:4002:830::200e:80    [S] (NEW)
```

