(function () {
    const writeToClipboard = async function (text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const discordIcon = document.querySelector('.fa-discord');
    discordIcon.addEventListener('click', (e) => {
        e.preventDefault();
        writeToClipboard('happyz#6345');

        if (document.querySelector('.copy-alert')) {
            return;
        }

        let copyAlert = document.createElement('span');
        copyAlert.classList.add('copy-alert');
        copyAlert.innerText = `happyz#6345 copied in the clipboard.`;
        document.body.appendChild(copyAlert);
        setTimeout(() => {
            document.body.removeChild(copyAlert);
        }, 3000);
    });

    particlesJS.load('background', 'assets/particles.json');

    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw 'WebGL2 not supported.';
    }

    const shaders = {
        vs: `#version 300 es
            in vec2 position;

            void main() {
                gl_Position = vec4(position, 0, 1);
            }
        `,

        fs: `#version 300 es
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_offset_y;
            uniform float u_time;
            out vec4 color;

            vec2 rot(vec2 uv, float r) {
                float sinX = sin(r);
                float cosX = cos(r);
                mat2 rotationMatrix = mat2(cosX, -sinX, sinX, cosX);
                return uv * rotationMatrix;
            }

            void main() {
                vec2 relativeCoord = gl_FragCoord.xy / u_resolution.xy;

                // Shadow
                if (relativeCoord.x > 0.95 || relativeCoord.y < 0.05) {
                    if (relativeCoord.x > 0.05 && relativeCoord.y < 0.95) {
                        color = vec4(0.0, 0.0, 0.0, 0.75);
                    }
                    return;
                }

                vec2 absoluteCoord = vec2(gl_FragCoord.x / u_resolution.x, (gl_FragCoord.y - u_offset_y) / u_resolution.y);

                // Waves
                // ducklett @ Shadertoy (https://www.shadertoy.com/view/WsB3Wc)
                float s = 4.0; // Number of stripes
                float st = 0.4; // Stripe thickness

                vec2 uv = rot(absoluteCoord, -0.2 + sin(u_time) * 0.05);
                //vec2 uv = (gl_FragCoord.xy + u_offset.xy) / u_resolution.xy;
                //vec2 uv = vec2((gl_FragCoord.x + u_offset.x) / u_resolution.x, (gl_FragCoord.y + u_offset.y) / u_resolution.y);

                float osc = sin(uv.x * (uv.x + 0.5) * 15.0) * 0.2;
                uv.y += osc * sin(u_time + uv.x * 2.0);
                uv.y = fract(uv.y * s);

                vec3 bg = vec3(0.996, 0.137, 0.333);
                vec3 fg = vec3(0.024, 0.0, 0.02);

                float mask = smoothstep(0.5, 0.6, uv.y);
                mask += smoothstep(0.5 + st, 0.6 + st, 1.0 - uv.y);

                color = vec4(mask * bg + (1.0 - mask) * fg, 1.0);
            }
    `};

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, shaders.vs);
    gl.shaderSource(fragmentShader, shaders.fs);
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

    const randomStart = Math.random() * 1000;
    const render = function (time) {
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
