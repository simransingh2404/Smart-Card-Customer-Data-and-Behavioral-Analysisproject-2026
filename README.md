# lfw – Linux Firewall

![Project](https://img.shields.io/badge/lfw-purple.svg)
![Language](https://img.shields.io/badge/C11-blue.svg)

`lfw` is a stateful Linux firewall daemon that intercepts packets using the Netfilter NFQUEUE mechanism and evaluates them against a human-readable ruleset.


## 1. Features

* **NFQUEUE-based daemon**: Intercepts packets from `iptables` and issues ACCEPT or DROP verdicts.
* **Stateful connection tracking**: Tracks active 5-tuple connections (Source IP, Destination IP, Source Port, Destination Port, Protocol) with a background thread that periodically purges expired connections.
* **Subnet/CIDR Matching**: Supports bitwise subnet masking for rule definitions (e.g. `/24`, `/16`, or `any`).
* **Thread-Safe Architecture**: Full concurrency protection utilizing reader-writer locks (`pthread_rwlock_t`) for rules evaluation/reload and mutexes (`pthread_mutex_t`) for connection tracking.
* **On-the-fly Config Reload (SIGHUP)**: Dynamic reload of rulesets without terminating the daemon or dropping active connection tracking states.
* **Operational Metrics (SIGUSR1)**: Real-time statistics dump of rule hits, throughput bytes, and connection counts directly to syslog.
* **Production Logging**: Integration with `syslog` for structured, prioritize-based system logging.
* **IPv4 Support**: Full support for TCP, UDP, and ICMP.


## 2. Requirements

To build and run `lfw`, you need the following:

* **Linux** with `iptables` support.
* **GCC** with C11 support.
* **Libraries**: `libnetfilter_queue` and `libpcap` (for the test tool).

On Debian/Ubuntu:

```bash
sudo apt install build-essential libnetfilter-queue-dev libpcap-dev
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

Run `lfw` as root so it can interact with Netfilter:

```bash
cd /path/to/lfw
sudo build/lfw
```

If you want to use a custom rules file:

```bash
sudo build/lfw /path/to/custom.rules
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

For enterprise integration, you can install the provided systemd service unit:

1. Copy the unit file:
   ```bash
   sudo cp lfw.service /etc/systemd/system/lfw.service
   ```
2. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable lfw
   sudo systemctl start lfw
   ```


## 6. Internal Architecture

* **Core Engine**: Orchestrates the lookup process, checking the state table before rules evaluation. Protected by a readers-writer lock (`pthread_rwlock_t`) for thread-safe concurrent lookups.
* **State Table**: A hash table with 4096 entries used to track active TCP and UDP connections using linear probing with tombstone markers. Protected by a mutex (`pthread_mutex_t`).
* **Background Housekeeper**: A thread running concurrently that purges expired connection entries every 10 seconds.
* **Packet Parser**: Extracts L3 and L4 headers from raw NFQUEUE data and records packet sizes.
* **Config Loader**: Parses text-based rule files into memory, compiling CIDR prefixes to network byte-order masks.


## 7. Quick start (TL;DR)

```bash
# 1) Install dependencies (Debian/Ubuntu/Kali)
sudo apt install build-essential libnetfilter-queue-dev libpcap-dev

# 2) Build
cd /path/to/lfw
make

# 3) Install rules
sudo mkdir -p /etc/lfw
sudo cp lfw.rules /etc/lfw/lfw.rules

# 4) Run the firewall daemon
sudo build/lfw
```

After this, your incoming packets that hit the NFQUEUE rule will be filtered according to `lfw.rules`.

