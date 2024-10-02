import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './bg.css';

const App = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Set up camera
    const camera = new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0.1,
      10
    );
    camera.position.z = 1;

    // Set up scene
    const scene = new THREE.Scene();

    // Set up geometry
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Load shaders
    const vertShader = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;

      void main() {
        vUv = .5 * (a_position + 1.);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragShader = `
      precision mediump float;

      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform float u_scroll_progress;

      vec2 rotate(vec2 uv, float th) {
          return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }

      float neuro_shape(vec2 uv, float t, float p) {
          vec2 sine_acc = vec2(0.);
          vec2 res = vec2(0.);
          float scale = 8.;

          for (int j = 0; j < 15; j++) {
              uv = rotate(uv, 1.);
              sine_acc = rotate(sine_acc, 1.);
              vec2 layer = uv * scale + float(j) + sine_acc - t;
              sine_acc += sin(layer);
              res += (.5 + .5 * cos(layer)) / scale;
              scale *= (1.2 - .07 * p);
          }
          return res.x + res.y;
      }

      void main() {
          vec2 uv = .5 * vUv;
          uv.x *= u_ratio;

          vec2 pointer = vUv - u_pointer_position;
          pointer.x *= u_ratio;
          float p = clamp(length(pointer), 0., 1.);
          p = .5 * pow(1. - p, 2.);

          float t = .001 * u_time;
          vec3 color = vec3(0.);

          float noise = neuro_shape(uv, t, p);

          noise = 1.2 * pow(noise, 3.);
          noise += pow(noise, 10.);
          noise = max(.0, noise - .5);
          noise *= (1. - length(vUv - .5));

          color = normalize(vec3(.2, .5 + .4 * cos(3. * u_scroll_progress), .5 + .5 * sin(3. * u_scroll_progress)));

          color = color * noise;

          gl_FragColor = vec4(color, noise);
      }
    `;

    // Set up material
    const uniforms = {
      u_time: { value: 0.0 },
      u_ratio: { value: window.innerWidth / window.innerHeight },
      u_pointer_position: { value: new THREE.Vector2(0.5, 0.5) },
      u_scroll_progress: { value: 0.0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: uniforms,
    });

    // Set up mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const animate = (time) => {
      uniforms.u_time.value = time * 0.001; // Convert to seconds
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_ratio.value = window.innerWidth / window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="content">
      <div className="section">
        <div>Ghassen Nefzi</div>
      </div>
      <div className="section">
        <div>
          GLSL shader based on{' '}
          <a href="https://x.com/ghassen/" target="_blank" rel="noreferrer">
            @ghassen.nfz
          </a>{' '}
          <a
            href="https://x.com/ghassen/"
            target="_blank"
            rel="noreferrer"
          >
            artwork
          </a>
        </div>
      </div>
      <div className="section">
        <div>
          <a href="https://linkedin.com/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://codepen.io/" target="_blank" rel="noreferrer">
            CodePen
          </a>
          <a href="https://x.com/" target="_top" rel="noreferrer">
            X (Twitter)
          </a>
        </div>
      </div>
      <canvas id="neuro" ref={canvasRef}></canvas>
    </div>
  );
};

export default App;
