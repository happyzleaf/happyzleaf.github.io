(function () {
    let writeToClipboard = async function (text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }

        if (document.querySelector('.copy-alert')) {
            return;
        }

        let copyAlert = document.createElement('span');
        copyAlert.classList.add('copy-alert');
        copyAlert.innerText = `${text} copied.`;
        document.body.appendChild(copyAlert);
        setTimeout(() => {
            document.body.removeChild(copyAlert);
        }, 3000);
    };

    for (let element of document.querySelectorAll('[data-copy-to-clipboard]')) {
        let text = element.getAttribute('data-copy-to-clipboard');
        element.addEventListener('click', (e) => {
            e.preventDefault();
            writeToClipboard(text);
        });
    }

    particlesJS.load('background', '/assets/particles.json');

    let readFile = function (path) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', path, false);
        xhr.send(null);
        return xhr.responseText;
    };

    let canvas = document.querySelector('canvas');
    let gl = canvas.getContext('webgl2');
    if (!gl) {
        throw 'WebGL2 not supported.';
    }

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, readFile('/assets/shaders/shader.vert'));
    gl.shaderSource(fragmentShader, readFile('/assets/shaders/shader.frag'));
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) || !gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Could not compile one or more shaders.');
        console.error(`Vertex: ${gl.getShaderInfoLog(vertexShader)}`);
        console.error(`Fragment: ${gl.getShaderInfoLog(fragmentShader)}`);

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return;
    }

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let vertexBufferPosition = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
        -1, 1,
        1, -1,
        1, 1,
    ]), gl.STATIC_DRAW);
    let position = gl.getAttribLocation(program, 'position');
    gl.vertexAttribPointer(position, 2, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(position);

    gl.useProgram(program);

    let u_resolution = gl.getUniformLocation(program, 'u_resolution');
    let u_offset_y = gl.getUniformLocation(program, 'u_offset_y');
    let u_time = gl.getUniformLocation(program, 'u_time');

    let randomStart = Math.random() * 1000;
    let render = function (time) {
        // time = (time * 0.001) % 10 / 10; // From 0 to 1 every 10 seconds
        time = time * 0.0001;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1f(u_offset_y, canvas.getBoundingClientRect().top);
        gl.uniform1f(u_time, randomStart + time);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }

    new ResizeObserver(() => {
        cancelAnimationFrame(render);

        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2fv(u_resolution, new Float32Array([canvas.width, canvas.height]));
        }

        requestAnimationFrame(render);
    }).observe(canvas);
})();
