/**
 * asciiMascot.ts
 * Mascote Claude Code em geometria pura Three.js + AsciiEffect oficial
 */

import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

export class AsciiMascot {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private effect: any; // AsciiEffect
  private mascotGroup: THREE.Group;
  private animationId: number | null = null;
  private mousePosition = { x: 0, y: 0 };
  private targetRotation = { x: 0, y: 0 };
  private isDarkMode = true;
  private observer: MutationObserver | null = null;

  // Bound handlers for proper cleanup
  private boundMouseMove: (e: MouseEvent) => void;
  private boundResize: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.isDarkMode = document.documentElement.classList.contains('dark');

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 2.2);

    // Renderer (offscreen)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);

    // AsciiEffect
    this.effect = new AsciiEffect(this.renderer, ' .:-=+*#%@', {
      resolution: 0.22,
      color: false,
      alpha: true,
    });
    this.effect.setSize(width, height);
    this.effect.domElement.style.width = '100%';
    this.effect.domElement.style.height = '100%';
    this.effect.domElement.style.position = 'absolute';
    this.effect.domElement.style.inset = '0';
    this.effect.domElement.style.overflow = 'hidden';
    this.updateAsciiColors();
    container.appendChild(this.effect.domElement);

    // Lighting
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 5, 5);
    this.scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xFF6B00, 1.5, 10);
    pointLight.position.set(-2, 2, 3);
    this.scene.add(pointLight);

    // Mascot
    this.mascotGroup = new THREE.Group();
    this.buildClaudeMascot();
    this.scene.add(this.mascotGroup);

    // Events (bound for cleanup)
    this.boundMouseMove = (e: MouseEvent) => this.handleMouseMove(e);
    this.boundResize = () => this.handleResize();
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('resize', this.boundResize);

    // Dark mode observer
    this.observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark');
      if (dark !== this.isDarkMode) {
        this.isDarkMode = dark;
        this.updateAsciiColors();
      }
    });
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    this.animate();
  }

  private updateAsciiColors(): void {
    const el = this.effect.domElement;
    if (this.isDarkMode) {
      el.style.color = '#FF8C3A';
      el.style.backgroundColor = 'transparent';
    } else {
      el.style.color = '#CC5500';
      el.style.backgroundColor = 'transparent';
    }
  }

  private buildClaudeMascot(): void {
    const orange = new THREE.MeshStandardMaterial({
      color: 0xC67A5C,
      metalness: 0.1,
      roughness: 0.7,
      emissive: 0xC67A5C,
      emissiveIntensity: 0.15,
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.1,
      roughness: 0.8,
    });

    // Reference anatomy:
    // - Wide rectangular head/body (wider than tall)
    // - Ears: square blocks that stick OUT to the sides at the TOP corners
    //   (they extend beyond the head width, aligned with the top edge)
    // - Eyes: > and < chevrons, positioned in upper-middle area of face
    // - Legs: two wide blocks at bottom with a gap in the center

    const headW = 1.4;
    const headH = 1.1;
    const headD = 0.7;

    // Main head/body
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(headW, headH, headD),
      orange
    );
    head.position.set(0, 0.15, 0);
    this.mascotGroup.add(head);

    // Ears — stick out to the SIDES at top corners
    // They are square blocks that extend outward from the head
    const earW = 0.35;
    const earH = 0.45;
    const earD = headD;

    // Left ear: positioned to the LEFT of the head, aligned with the top
    const leftEar = new THREE.Mesh(
      new THREE.BoxGeometry(earW, earH, earD),
      orange
    );
    // x: head left edge + half ear width outward
    // y: aligned with top of head (top of head = 0.15 + headH/2 = 0.7)
    //    ear center at top minus half ear height
    leftEar.position.set(
      -(headW / 2 + earW / 2),  // sticking out to the left
      0.15 + headH / 2 - earH,  // lowered: top of ear aligned ~middle-upper head
      0
    );
    this.mascotGroup.add(leftEar);

    // Right ear: mirror of left
    const rightEar = new THREE.Mesh(
      new THREE.BoxGeometry(earW, earH, earD),
      orange
    );
    rightEar.position.set(
      headW / 2 + earW / 2,  // sticking out to the right
      0.15 + headH / 2 - earH,
      0
    );
    this.mascotGroup.add(rightEar);

    // Eyes: > and < chevrons in the upper-middle area of face
    this.buildChevronEye(-0.32, 0.3, headD / 2 + 0.01, '>', darkMat);
    this.buildChevronEye(0.32, 0.3, headD / 2 + 0.01, '<', darkMat);

    // Legs — 4 thin legs: 2 on left side, gap in center, 2 on right side
    const legW = 0.2;
    const legH = 0.5;
    const legD = headD;
    const headBottom = 0.15 - headH / 2;  // = -0.4
    const legY = headBottom - legH / 2;
    const legGeo = new THREE.BoxGeometry(legW, legH, legD);

    // Far-left leg
    const leg1 = new THREE.Mesh(legGeo, orange);
    leg1.position.set(-0.55, legY, 0);
    this.mascotGroup.add(leg1);

    // Inner-left leg
    const leg2 = new THREE.Mesh(legGeo, orange);
    leg2.position.set(-0.25, legY, 0);
    this.mascotGroup.add(leg2);

    // Inner-right leg
    const leg3 = new THREE.Mesh(legGeo, orange);
    leg3.position.set(0.25, legY, 0);
    this.mascotGroup.add(leg3);

    // Far-right leg
    const leg4 = new THREE.Mesh(legGeo, orange);
    leg4.position.set(0.55, legY, 0);
    this.mascotGroup.add(leg4);

    // Orbiting particles
    this.createOrbitingParticles();
  }

  private buildChevronEye(
    cx: number, cy: number, cz: number,
    dir: '>' | '<',
    mat: THREE.Material
  ): void {
    // Each chevron arm is a thin box rotated 45deg
    const armLen = 0.18;
    const armThick = 0.06;
    const armDepth = 0.08;

    // Top arm
    const topArm = new THREE.Mesh(
      new THREE.BoxGeometry(armLen, armThick, armDepth),
      mat
    );
    // Bottom arm
    const bottomArm = new THREE.Mesh(
      new THREE.BoxGeometry(armLen, armThick, armDepth),
      mat
    );

    const angle = dir === '>' ? -Math.PI / 4 : Math.PI / 4;

    topArm.rotation.z = angle;
    topArm.position.set(cx, cy + 0.07, cz);
    this.mascotGroup.add(topArm);

    bottomArm.rotation.z = -angle;
    bottomArm.position.set(cx, cy - 0.07, cz);
    this.mascotGroup.add(bottomArm);
  }

  private createOrbitingParticles(): void {
    const count = 50;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.2 + Math.random() * 0.2;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xFF6B00,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    this.mascotGroup.add(new THREE.Points(geo, mat));
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.container.getBoundingClientRect();
    this.mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private handleResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.effect.setSize(w, h);
  }

  private animate = (): void => {
    const time = Date.now() * 0.001;

    // Smooth mouse following (lerp 0.05)
    this.targetRotation.y = this.mousePosition.x * 0.3;
    this.targetRotation.x = this.mousePosition.y * 0.2;

    this.mascotGroup.rotation.y += (this.targetRotation.y - this.mascotGroup.rotation.y) * 0.05;
    this.mascotGroup.rotation.x += (this.targetRotation.x - this.mascotGroup.rotation.x) * 0.05;

    // Passive floating
    this.mascotGroup.rotation.y += Math.sin(time * 0.6) * 0.002;
    this.mascotGroup.position.y = Math.sin(time * 0.4) * 0.05;

    // Rotate particles
    const particles = this.mascotGroup.children.find(c => c instanceof THREE.Points);
    if (particles) {
      particles.rotation.y = time * 0.15;
      particles.rotation.x = time * 0.08;
    }

    this.effect.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };

  public destroy(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('resize', this.boundResize);
    this.observer?.disconnect();
    if (this.effect.domElement.parentNode) {
      this.effect.domElement.parentNode.removeChild(this.effect.domElement);
    }
    this.renderer.dispose();
    this.scene.clear();
  }
}
