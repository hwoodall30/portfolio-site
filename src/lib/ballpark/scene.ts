import * as THREE from 'three';

// All geometry is authored here; no remote models, textures, or render loop are needed.
export function createBallpark(host: HTMLElement) {
	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
	renderer.setClearColor(0x000000, 0);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.domElement.setAttribute('aria-hidden', 'true');
	host.appendChild(renderer.domElement);
	const scene = new THREE.Scene();
	const camera = new THREE.OrthographicCamera(-15, 15, 12, -12, 0.1, 100);
	camera.position.set(15, 19, 23);
	camera.lookAt(0, 0, 0);
	scene.add(new THREE.HemisphereLight(0xffffff, 0x5b6d4e, 2.8));
	const sun = new THREE.DirectionalLight(0xfff5df, 3.5);
	sun.position.set(-8, 16, 5);
	scene.add(sun);
	const park = new THREE.Group();
	park.rotation.y = -0.22;
	scene.add(park);
	const materials: THREE.Material[] = [];
	const geometries: THREE.BufferGeometry[] = [];
	function material(color: number, roughness = 0.8) {
		const m = new THREE.MeshStandardMaterial({ color, roughness });
		materials.push(m);
		return m;
	}
	const cream = material(0xe1ddc9),
		stone = material(0xc5c2ae),
		green = material(0x548468);
	const lightGreen = material(0x639373),
		seat = material(0x315b50),
		seatAlt = material(0x416b5d);
	const dirt = material(0xc29774),
		chalk = material(0xf5f0d9),
		metal = material(0x8c9a91);
	function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
		geometries.push(geometry);
		const m = new THREE.Mesh(geometry, mat);
		m.position.set(x, y, z);
		park.add(m);
		return m;
	}
	function outline(scale: number) {
		const s = new THREE.Shape();
		s.moveTo(0, -5 * scale);
		s.lineTo(Math.cos(Math.PI / 4) * 10 * scale, (Math.sin(Math.PI / 4) * 10 - 5) * scale);
		s.absarc(0, -5 * scale, 10 * scale, Math.PI / 4, (Math.PI * 3) / 4, false);
		s.lineTo(0, -5 * scale);
		s.closePath();
		return s;
	}
	function surface(shape: THREE.Shape, mat: THREE.Material, elevation: number, depth = 0.12) {
		const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 60 });
		g.rotateX(-Math.PI / 2);
		return mesh(g, mat, 0, elevation, 0);
	}
	surface(outline(1.42), stone, -0.5, 0.45);
	surface(outline(1.38), cream, -0.05, 0.18);
	surface(outline(1), green, 0.12, 0.06);
	// Graduated terraces wrap the full fan, including both baselines.
	for (let row = 0; row < 9; row++) {
		const s = outline(1.04 + row * 0.035);
		const hole = new THREE.Path(
			outline(1.015 + row * 0.035)
				.getPoints(70)
				.reverse()
		);
		s.holes.push(hole);
		surface(s, row % 2 ? seat : seatAlt, 0.2 + row * 0.13, 0.13);
	}
	// Mowing bands follow the outfield arc.
	for (let i = 0; i < 5; i++) {
		const g = new THREE.RingGeometry(4.4 + i, 4.9 + i, 80, 1, Math.PI / 4, Math.PI / 2);
		g.rotateX(-Math.PI / 2);
		mesh(g, lightGreen, 0, 0.19, 5);
	}
	const diamond = mesh(new THREE.BoxGeometry(4.5, 0.025, 4.5), dirt, 0, 0.21, 1.8);
	diamond.rotation.y = Math.PI / 4;
	const inner = mesh(new THREE.BoxGeometry(2.7, 0.03, 2.7), green, 0, 0.23, 1.8);
	inner.rotation.y = Math.PI / 4;
	mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 32), dirt, 0, 0.26, 1.8);
	for (const [x, z] of [
		[0, 4.8],
		[2.8, 1.8],
		[0, -1.1],
		[-2.8, 1.8]
	]) {
		const base = mesh(new THREE.BoxGeometry(0.23, 0.04, 0.23), chalk, x, 0.26, z);
		base.rotation.y = Math.PI / 4;
	}
	for (const sign of [-1, 1]) {
		const line = mesh(new THREE.BoxGeometry(0.045, 0.018, 9.8), chalk, sign * 3.4, 0.24, 1.2);
		line.rotation.y = (sign * -Math.PI) / 4;
	}
	// A freestanding scoreboard and four floodlight towers give the silhouette depth.
	mesh(new THREE.BoxGeometry(3.8, 1.7, 0.22), seat, 0, 2.5, -7.5);
	for (const x of [-1.35, 1.35]) mesh(new THREE.BoxGeometry(0.13, 2, 0.13), metal, x, 0.8, -7.5);
	for (let i = 0; i < 9; i++)
		mesh(new THREE.BoxGeometry(0.17, 0.2, 0.025), chalk, -1.35 + i * 0.34, 2.6, -7.37);
	for (const [x, z] of [
		[-9, -2],
		[9, -2],
		[-6, 6],
		[6, 6]
	]) {
		mesh(new THREE.CylinderGeometry(0.055, 0.09, 4.5, 8), metal, x, 2, z);
		mesh(new THREE.BoxGeometry(1.25, 0.6, 0.16), metal, x, 4.3, z);
		for (let bulb = 0; bulb < 4; bulb++)
			mesh(new THREE.BoxGeometry(0.21, 0.37, 0.06), chalk, x - 0.45 + bulb * 0.3, 4.3, z + 0.1);
	}
	function render() {
		renderer.render(scene, camera);
	}
	function resize() {
		const w = host.clientWidth,
			h = host.clientHeight;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		const halfHeight = 10.5;
		camera.left = (-halfHeight * w) / h;
		camera.right = (halfHeight * w) / h;
		camera.top = halfHeight;
		camera.bottom = -halfHeight;
		camera.updateProjectionMatrix();
		render();
	}
	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(host);
	resize();
	const canvas = renderer.domElement;
	let gesture: { id: number; x: number; y: number; rotation: number; elevation: number } | null =
		null;
	let dragging = false;
	const cameraRadius = camera.position.length();
	const azimuth = Math.atan2(camera.position.x, camera.position.z);
	function pointerDown(event: PointerEvent) {
		if (gesture || !event.isPrimary || event.button !== 0) return;
		dragging = false;
		gesture = {
			id: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			rotation: park.rotation.y,
			elevation: Math.asin(camera.position.y / cameraRadius)
		};
		canvas.setPointerCapture(event.pointerId);
		canvas.style.cursor = 'grabbing';
	}
	function pointerMove(event: PointerEvent) {
		if (!gesture || gesture.id !== event.pointerId) return;
		const dx = event.clientX - gesture.x,
			dy = event.clientY - gesture.y;
		if (!dragging && (event.pointerType === 'touch' ? Math.abs(dx) : Math.hypot(dx, dy)) < 5)
			return;
		dragging = true;
		park.rotation.y = gesture.rotation + dx * 0.008;
		// Touch retains vertical page scrolling; mouse/pen can also tilt the view.
		if (event.pointerType !== 'touch') {
			const elevation = THREE.MathUtils.clamp(gesture.elevation + dy * 0.005, 0.25, 1.2);
			const horizontal = cameraRadius * Math.cos(elevation);
			camera.position.set(
				horizontal * Math.sin(azimuth),
				cameraRadius * Math.sin(elevation),
				horizontal * Math.cos(azimuth)
			);
			camera.lookAt(0, 0, 0);
		}
		render();
	}
	function pointerEnd(event: PointerEvent) {
		if (!gesture || gesture.id !== event.pointerId) return;
		gesture = null;
		canvas.style.cursor = 'grab';
		if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
	}
	canvas.style.cursor = 'grab';
	canvas.style.touchAction = 'pan-y';
	canvas.addEventListener('pointerdown', pointerDown);
	canvas.addEventListener('pointermove', pointerMove);
	canvas.addEventListener('pointerup', pointerEnd);
	canvas.addEventListener('pointercancel', pointerEnd);
	canvas.addEventListener('lostpointercapture', pointerEnd);
	return {
		rotate(direction: number) {
			park.rotation.y += direction * 0.3;
			render();
		},
		dispose() {
			resizeObserver.disconnect();
			canvas.removeEventListener('pointerdown', pointerDown);
			canvas.removeEventListener('pointermove', pointerMove);
			canvas.removeEventListener('pointerup', pointerEnd);
			canvas.removeEventListener('pointercancel', pointerEnd);
			canvas.removeEventListener('lostpointercapture', pointerEnd);
			geometries.forEach((g) => g.dispose());
			materials.forEach((m) => m.dispose());
			renderer.dispose();
			renderer.domElement.remove();
		}
	};
}
