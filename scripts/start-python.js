const { spawn, spawnSync } = require('child_process');
const path = require('path');

// Try several Python executables for cross-platform compatibility
const candidates = ['python', 'py', 'python3'];
const uvicornArgs = ['-m', 'uvicorn', 'api.main:app', '--reload', '--port', '8000'];
const requirementsPath = path.join(__dirname, '..', 'python_ai', 'requirements.txt');

function tryStart(cmdIndex) {
  if (cmdIndex >= candidates.length) {
    console.error('Failed to start Python server: no python executable found (tried:', candidates.join(', '), ')');
    process.exit(1);
  }

  const cmd = candidates[cmdIndex];
  // First, check if uvicorn is importable with this python
  try {
    const check = spawnSync(cmd, ['-c', 'import uvicorn'], {
      cwd: path.join(__dirname, '..', 'python_ai'),
      stdio: 'ignore',
      shell: false,
    });

    if (check.status !== 0) {
      console.warn(`${cmd} does not have uvicorn installed. Attempting to install requirements...`);
      // Try to install requirements using this python
      const install = spawnSync(cmd, ['-m', 'pip', 'install', '-r', requirementsPath], {
        cwd: path.join(__dirname, '..', 'python_ai'),
        stdio: 'inherit',
        shell: false,
      });

      if (install.status !== 0) {
        console.warn(`Failed to install requirements with ${cmd}. Trying next python candidate...`);
        return tryStart(cmdIndex + 1);
      }
    }

    // Start uvicorn with this python
    const proc = spawn(cmd, uvicornArgs, {
      cwd: path.join(__dirname, '..', 'python_ai'),
      stdio: 'inherit',
      shell: false,
    });

    proc.on('error', (err) => {
      console.warn(`Failed to start with ${cmd}: ${err.message}. Trying next...`);
      tryStart(cmdIndex + 1);
    });

    proc.on('exit', (code, signal) => {
      if (code !== 0) {
        console.warn(`Python server exited with code ${code} (signal: ${signal})`);
      }
      process.exit(code === null ? 0 : code);
    });

  } catch (e) {
    console.warn(`Error testing ${cmd}: ${e.message}. Trying next...`);
    tryStart(cmdIndex + 1);
  }
}

tryStart(0);
