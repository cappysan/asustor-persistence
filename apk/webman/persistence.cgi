#!/bin/sh
# Persistence CGI

BODY=""
if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -n "$CONTENT_LENGTH" ] && [ "$CONTENT_LENGTH" -gt 0 ]; then
        BODY=$(dd bs="$CONTENT_LENGTH" count=1 2>/dev/null)
    else
        BODY=$(cat)
    fi
fi

ALL_PARAMS="${QUERY_STRING}&${BODY}"

urldecode() {
    echo "$1" | awk 'BEGIN{
        for (i=0; i<256; i++) chr[sprintf("%02X", i)] = sprintf("%c", i)
    }
    {
        gsub(/\+/, " ")
        out = ""
        while (match($0, /%[0-9A-Fa-f][0-9A-Fa-f]/)) {
            out = out substr($0, 1, RSTART-1) chr[toupper(substr($0, RSTART+1, 2))]
            $0 = substr($0, RSTART+RLENGTH)
        }
        print out $0
    }'
}

get_param() {
    raw=$(echo "$ALL_PARAMS" | tr '&' '\n' | grep "^${1}=" | head -1 | cut -d= -f2-)
    urldecode "$raw"
}

# Read all params upfront
ACT=$(get_param act)
TAB=$(get_param tab)
case "$TAB" in
    dns|docker|hosts) ;;
    *) TAB="dns" ;;
esac

respond() {
    printf 'Content-Type: application/json\r\n\r\n'
    printf '%s' "$1"
}

find_python() {
    for P in python3 /usr/local/bin/python3 /usr/bin/python3 python /usr/bin/python; do
        if command -v "$P" >/dev/null 2>&1; then echo "$P"; return; fi
    done
}

CFG_DIR="/share/Configuration/persistence"
if [ -n "$APKG_CFG_DIR" ]; then CFG_DIR="$APKG_CFG_DIR"; fi
NAS_CONF="/etc/nas.conf"

case "$ACT" in

    get)
        PYTHON=$(find_python)
        if [ -z "$PYTHON" ]; then
            respond '{"success":false,"error_code":500,"error_msg":"No python interpreter found"}'
            exit 0
        fi

        case "$TAB" in
            dns)
                FILE="${CFG_DIR}/etc/resolv.conf"
                SAMPLE="${CFG_DIR}/etc/resolv.sample.conf"
                if [ -f "$FILE" ]; then
                    ACTIVE=1; TARGET="$FILE"
                elif [ -f "$SAMPLE" ]; then
                    ACTIVE=0; TARGET="$SAMPLE"
                else
                    ACTIVE=0; TARGET=""
                fi

                RESULT=$("$PYTHON" - << PYEOF 2>&1
import json, os, configparser
target = '${TARGET}'
content = ''
if target and os.path.exists(target):
    try:
        with open(target) as f:
            content = f.read()
    except Exception:
        pass
def read_ini_value(path, section, key):
    try:
        with open(path) as f:
            raw = '[__root__]\n' + f.read()
        cp = configparser.RawConfigParser()
        cp.read_string(raw)
        for s in cp.sections():
            if s.lower() == section.lower():
                for k, v in cp.items(s):
                    if k.lower() == key.lower():
                        return v.strip()
    except Exception:
        pass
    return ''
nas = '${NAS_CONF}'
domain_dns    = read_ini_value(nas, 'Network', 'DomainDNS')
primary_dns   = read_ini_value(nas, 'Network', 'PrimaryDNS')
secondary_dns = read_ini_value(nas, 'Network', 'SecondaryDNS')
search_val = ''
if target and os.path.exists(target):
    try:
        with open(target) as f:
            for line in f:
                line = line.strip()
                if line.startswith('search '):
                    search_val = line[7:].strip()
                    break
    except Exception:
        pass
system_resolv = ''
try:
    with open('/etc/resolv.conf') as f:
        system_resolv = f.read()
except Exception:
    pass
print(json.dumps({'success': True, 'active': bool(${ACTIVE}), 'content': content, 'domain_dns': domain_dns, 'primary_dns': primary_dns, 'secondary_dns': secondary_dns, 'search_val': search_val, 'system_content': system_resolv}))
PYEOF
)
                printf 'Content-Type: application/json\r\n\r\n'
                printf '%s' "$RESULT"
                ;;

            docker)
                PYTHON=$(find_python)
                RESULT=$("$PYTHON" - << PYEOF 2>&1
import json, os
target = '${CFG_DIR}/etc/docker/daemon.json'
content = ''
if os.path.exists(target):
    try:
        with open(target) as f:
            content = f.read()
    except Exception:
        pass
print(json.dumps({'success': True, 'content': content}))
PYEOF
)
                printf 'Content-Type: application/json\r\n\r\n'
                printf '%s' "$RESULT"
                ;;

            hosts)
                FILE="${CFG_DIR}/etc/hosts"
                if [ -f "$FILE" ]; then ACTIVE=1; TARGET="$FILE"
                else ACTIVE=0; TARGET=""; fi

                RESULT=$("$PYTHON" - << PYEOF 2>&1
import json, os
target = '${TARGET}'
content = ''
if target and os.path.exists(target):
    try:
        with open(target) as f:
            content = f.read()
    except Exception:
        pass
system_f = ''
try:
    with open('/etc/hosts') as f:
        system_f = f.read()
except Exception:
    pass
print(json.dumps({'success': True, 'active': bool(${ACTIVE}), 'content': content, 'system_content': system_f}))
PYEOF
)
                printf 'Content-Type: application/json\r\n\r\n'
                printf '%s' "$RESULT"
                ;;
        esac
        ;;

    set)
        PYTHON=$(find_python)
        if [ -z "$PYTHON" ]; then
            respond '{"success":false,"error_code":500,"error_msg":"No python interpreter found"}'
            exit 0
        fi

        case "$TAB" in
            dns)
                SEARCH=$(get_param search)
                PRIMARY=$(get_param primary_dns)
                SECONDARY=$(get_param secondary_dns)
                TARGET="${CFG_DIR}/etc/resolv.conf"
                mkdir -p "$(dirname "$TARGET")"
                {
                    [ -n "$SEARCH" ]    && printf 'search %s\n'    "$SEARCH"
                    [ -n "$PRIMARY" ]   && printf 'nameserver %s\n' "$PRIMARY"
                    [ -n "$SECONDARY" ] && printf 'nameserver %s\n' "$SECONDARY"
                    printf '\n'
                } > "$TARGET"
                respond '{"success":true}'
                ;;

            docker)
                CONTENT=$(get_param content)
                TARGET="${CFG_DIR}/etc/docker/daemon.json"
                mkdir -p "$(dirname "$TARGET")"
                PYTHON=$(find_python)
                printf '%s' "$CONTENT" | "$PYTHON" -c "
import sys,json
data=sys.stdin.read()
obj=json.loads(data)
print(json.dumps(obj,indent=2))
" > "$TARGET"
                respond '{"success":true}'
                ;;

            hosts)
                CONTENT=$(get_param content)
                TARGET="${CFG_DIR}/etc/hosts"
                mkdir -p "$(dirname "$TARGET")"
                printf '%s\n' "$CONTENT" > "$TARGET"
                respond '{"success":true}'
                ;;
        esac
        ;;

    restart)
        /usr/local/AppCentral/cappysan-persistence/CONTROL/start-stop.sh restart 2>&1
        respond '{"success":true}'
        ;;

    restart-docker)
        /usr/local/AppCentral/cappysan-persistence/CONTROL/start-stop.sh restart 2>&1
        respond '{"success":true}'
        ;;

    *)
        respond "{\"success\":false,\"error_code\":400,\"error_msg\":\"Unknown action: $ACT\"}"
        ;;
esac
exit 0
