#!/usr/local/bin/python3
import os, sys, json, configparser, shutil
from urllib.parse import parse_qs

REQUEST_METHOD = os.environ.get('REQUEST_METHOD', '')
QUERY_STRING   = os.environ.get('QUERY_STRING', '')
CONTENT_LENGTH = os.environ.get('CONTENT_LENGTH', '0')

body = ''
if REQUEST_METHOD == 'POST':
    try:
        length = int(CONTENT_LENGTH)
    except (ValueError, TypeError):
        length = 0
    if length > 0:
        body = sys.stdin.read(length)

def get_params(qs, body):
    p = {}
    for k, v in parse_qs(qs, keep_blank_values=True).items():
        p[k] = v[0]
    for k, v in parse_qs(body, keep_blank_values=True).items():
        p[k] = v[0]
    return p

params = get_params(QUERY_STRING, body)

def param(name, default=''):
    return params.get(name, default)

def respond(data):
    print('Content-Type: application/json\r\n\r\n' + json.dumps(data), end='', flush=True)

CFG_DIR  = '/share/Configuration/persistence'
NAS_CONF = '/etc/nas.conf'

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

def read_file(path):
    try:
        with open(path) as f:
            return f.read()
    except Exception:
        return ''

act = param('act')
tab = param('tab')
if tab not in ('dns', 'docker', 'hosts'):
    tab = 'dns'

if act == 'get':

    if tab == 'dns':
        file_path   = os.path.join(CFG_DIR, 'etc', 'resolv.conf')
        sample_path = os.path.join(CFG_DIR, 'etc', 'resolv.sample.conf')
        if os.path.exists(file_path):
            active, target = True, file_path
        elif os.path.exists(sample_path):
            active, target = False, sample_path
        else:
            active, target = False, None

        content = read_file(target) if target else ''
        search_val = ''
        if target:
            for line in content.splitlines():
                line = line.strip()
                if line.startswith('search '):
                    search_val = line[7:].strip()
                    break

        respond({
            'success':        True,
            'active':         active,
            'content':        content,
            'domain_dns':     read_ini_value(NAS_CONF, 'Network', 'DomainDNS'),
            'primary_dns':    read_ini_value(NAS_CONF, 'Network', 'PrimaryDNS'),
            'secondary_dns':  read_ini_value(NAS_CONF, 'Network', 'SecondaryDNS'),
            'search_val':     search_val,
            'system_content': read_file('/etc/resolv.conf'),
        })

    elif tab == 'docker':
        respond({
            'success': True,
            'content': read_file(os.path.join(CFG_DIR, 'etc', 'docker', 'daemon.json')),
        })

    elif tab == 'hosts':
        file_path = os.path.join(CFG_DIR, 'etc', 'hosts')
        active    = os.path.exists(file_path)
        respond({
            'success':        True,
            'active':         active,
            'content':        read_file(file_path) if active else '',
            'system_content': read_file('/etc/hosts'),
            'hosts_orig':     read_file('/etc/hosts.orig'),
        })

elif act == 'set':

    if tab == 'dns':
        search    = param('search')
        primary   = param('primary_dns')
        secondary = param('secondary_dns')
        target    = os.path.join(CFG_DIR, 'etc', 'resolv.conf')
        os.makedirs(os.path.dirname(target), exist_ok=True)
        lines = []
        if search:    lines.append('search '    + search)
        if primary:   lines.append('nameserver ' + primary)
        if secondary: lines.append('nameserver ' + secondary)
        lines.append('')
        try:
            with open(target, 'w') as f:
                f.write('\n'.join(lines))
            respond({'success': True})
        except Exception as e:
            respond({'success': False, 'error_code': 500, 'error_msg': str(e)})

    elif tab == 'docker':
        content = param('content')
        target  = os.path.join(CFG_DIR, 'etc', 'docker', 'daemon.json')
        os.makedirs(os.path.dirname(target), exist_ok=True)
        try:
            obj = json.loads(content)
            pretty = json.dumps(obj, indent=2)
            with open(target, 'w') as f:
                f.write(pretty)
            os.makedirs('/etc/docker', exist_ok=True)
            shutil.copy(target, '/etc/docker/daemon.json')
            respond({'success': True})
        except Exception as e:
            respond({'success': False, 'error_code': 500, 'error_msg': str(e)})

    elif tab == 'hosts':
        content = param('content')
        target  = os.path.join(CFG_DIR, 'etc', 'hosts')
        os.makedirs(os.path.dirname(target), exist_ok=True)
        try:
            with open(target, 'w') as f:
                f.write(content + '\n')
            respond({'success': True})
        except Exception as e:
            respond({'success': False, 'error_code': 500, 'error_msg': str(e)})

elif act == 'restart':
    ret = os.system('/usr/local/AppCentral/cappysan-persistence/CONTROL/start-stop.sh restart')
    respond({'success': True})

elif act == 'restart-docker':
    ret = os.system('/usr/local/AppCentral/cappysan-persistence/CONTROL/start-stop.sh restart')
    respond({'success': True})

else:
    respond({'success': False, 'error_code': 400, 'error_msg': 'Unknown action: {}'.format(act)})
