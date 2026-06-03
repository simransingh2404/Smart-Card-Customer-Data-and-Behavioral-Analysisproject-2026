# lfw – Linux Firewall

![Project](https://img.shields.io/badge/lfw-purple.svg)
![Language](https://img.shields.io/badge/C11-blue.svg)

`lfw` is a high-performance stateful Linux firewall daemon that intercepts and filters packets in-kernel using eBPF at the Traffic Control (TC) subsystem, evaluating them against a human-readable ruleset.


## 1. Features

* **eBPF/TC-based filtering**: Intercepts packets in-kernel at the Traffic Control (TC) ingress/egress hooks and issues high-performance ACCEPT or DROP/SHOT verdicts.
* **Stateful connection tracking**: Tracks active 5-tuple connections (Source IP, Destination IP, Source Port, Destination Port, Protocol) with a background thread that periodically purges expired connections.
* **Subnet/CIDR Matching**: Supports bitwise subnet masking for rule definitions (e.g. `/24`, `/16`, or `any`).
* **Thread-Safe Architecture**: Full concurrency protection utilizing reader-writer locks (`pthread_rwlock_t`) for rules evaluation/reload and mutexes (`pthread_mutex_t`) for connection tracking.
* **On-the-fly Config Reload (SIGHUP)**: Dynamic reload of rulesets without terminating the daemon or dropping active connection tracking states.
* **Operational Metrics (SIGUSR1)**: Real-time statistics dump of rule hits, throughput bytes, and connection counts directly to syslog.
* **Production Logging**: Integration with `syslog` for structured, prioritize-based system logging.
* **IPv4 Support**: Full support for TCP, UDP, and ICMP.


## 2. Requirements

To build and run `lfw`, you need the following:

* **Linux** kernel supporting eBPF and Traffic Control (TC) clsact.
* **GCC** with C11 support.
* **Libraries**: `libbpf` and `libpcap` (for the test tool).
* **Compilers**: `clang` and `llvm` (to compile the eBPF kernel program).

On Debian/Ubuntu:

```bash
sudo apt install build-essential clang llvm libbpf-dev libpcap-dev
```


## 3. Build & Installation

Clone the repo & navigate to the `lfw` repo:

```bash
git clone https://github.com/saurabh-857/lfw.git
cd lfw
```

From the project root:

```bash
make
```

This will:

- Build the main firewall daemon: `build/lfw`
- (Optionally) you can build the pcap test tool with:

```bash
make pcap-test
```

To clean:

```bash
make clean
```


## 4. Configuration

By default, `lfw` reads rules from:

- `/etc/lfw/lfw.rules`

You can also pass a custom rules file path as the first CLI argument:

```bash
sudo build/lfw /path/to/custom.rules
```

### 4.1 Syntax

One rule per line:

```text
ACTION [PROTO] [PORT] [from SRC] [to DST]
```

- **ACTION**: `allow` | `deny` (or `drop`)
- **PROTO**: `any` | `tcp` | `udp` | `icmp` (optional, default: any)
- **PORT**: integer port (e.g. `22`), or `PORT/PROTO` (e.g. `53/udp`) (optional; matches destination port)
- **SRC/DST**: `any`, IPv4 address (e.g. `192.168.1.10`), or CIDR subnet (e.g. `192.168.1.0/24`)

Lines starting with `#` or empty lines are ignored.

### 4.2 Examples

```text
# Deny by default
default deny

# Allow HTTP from a local subnet
allow tcp 80 from 192.168.1.0/24

# Allow SSH from any host
allow tcp 22

# Allow DNS from a specific subnet to a public resolver
allow 53/udp from 10.0.0.0/8 to 8.8.8.8/32

# Allow ICMP from anywhere
allow icmp
```

Place your rules into `/etc/lfw/lfw.rules` (or another file you pass on the command line).


## 5. Running the firewall

### 5.1 Prepare the rules file

Create the directory and copy your rules:

```bash
sudo mkdir -p /etc/lfw
sudo cp lfw.rules /etc/lfw/lfw.rules
```

Edit `/etc/lfw/lfw.rules` as needed (see examples above).

### 5.2 Start the daemon

Run `lfw` as root and specify the network interface to attach to:

```bash
cd /path/to/lfw
sudo build/lfw <interface>
```

For example, to run on the loopback (`lo`) interface or ethernet (`eth0`):

```bash
sudo build/lfw lo
```

If you want to use a custom rules file:

```bash
sudo build/lfw <interface> /path/to/custom.rules
```

### 5.3 Syslog logs and signals

Operational events and logs are sent to the system logger (`syslog`). You can view them using:

```bash
tail -f /var/log/syslog | grep lfw
# or using journalctl
journalctl -t lfw -f
```

The daemon supports operational control signals:

- **Reload Config**: Reload the rules configuration file dynamically without restarting:
  ```bash
  sudo kill -HUP $(pgrep lfw)
  ```
- **Dump Statistics**: Output active connections table size, rule hit counts, and byte counters:
  ```bash
  sudo kill -USR1 $(pgrep lfw)
  ```

### 5.4 Systemd Integration

For enterprise integration, you can install the provided systemd template service unit to manage the firewall on specific network interfaces:

1. Copy the template unit file:
   ```bash
   sudo cp lfw@.service /etc/systemd/system/lfw@.service
   ```
2. Enable and start the service for a specific network interface (e.g., `eth0`):
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable lfw@eth0
   sudo systemctl start lfw@eth0
   ```


## 6. Internal Architecture

* **eBPF Filter**: Intercepts packets directly in the kernel's TC ingress and egress pipelines, parsing packet headers (L3/L4) and matching them against active rules and connections for sub-microsecond filtering.
* **State/Conntrack Map**: A BPF Hash Map (`conntrack_map`) with up to 4096 entries to track active TCP and UDP connections.
* **Rules Map**: A BPF Array Map (`rules_map`) populated by the userspace daemon containing compiled rules.
* **Config Map**: A BPF Array Map (`config_map`) storing runtime configuration parameters (e.g., default action and rule count).
* **Background Housekeeper**: A userspace thread that periodically sweeps the `conntrack_map` in the kernel and deletes expired connections.
* **Config Loader**: Parses text-based rules files in userspace and synchronizes compiled rule structures and policies to the BPF maps.


## 7. Quick start (TL;DR)

```bash
# 1) Install dependencies (Debian/Ubuntu/Kali)
sudo apt install build-essential clang llvm libbpf-dev libpcap-dev

# 2) Build
cd /path/to/lfw
make

# 3) Install rules
sudo mkdir -p /etc/lfw
sudo cp lfw.rules /etc/lfw/lfw.rules

# 4) Run the firewall daemon on a chosen interface (e.g. eth0)
sudo build/lfw eth0
```

After this, incoming and outgoing packets on the specified interface will be filtered according to `lfw.rules`.

