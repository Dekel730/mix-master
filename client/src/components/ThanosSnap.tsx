import { useRef, useEffect } from 'react';
import './ThanosSnap.css';

interface ThanosSnapProps {
	isDisintegrating: boolean;
	particlesColors?: string[];
	children?: React.ReactNode;
}
const ThanosSnap = ({
	isDisintegrating,
	children,
	particlesColors,
}: ThanosSnapProps) => {
	const divRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isDisintegrating && divRef.current) {
			const particles = createParticles(divRef.current);
			animateParticles(particles);
		}
	}, [isDisintegrating]);

	const createParticles = (element: HTMLElement) => {
		const particles: HTMLDivElement[] = [];
		const rect = element.getBoundingClientRect();
		const particleCount = 1300;
		const colors = particlesColors || [
			'rgba(255, 255, 255, 0.8)',
			'rgba(200, 200, 200, 0.8)',
			'rgba(150, 150, 150, 0.8)',
		];

		for (let i = 0; i < particleCount; i++) {
			const particle = document.createElement('div');
			particle.classList.add('particle');
			particle.style.left = `${Math.random() * rect.width + rect.left}px`;
			particle.style.top = `${Math.random() * rect.height + rect.top}px`;
			particle.style.backgroundPosition = `${-particle.style
				.left} ${-particle.style.top}`;
			particle.style.backgroundColor =
				colors[Math.floor(Math.random() * colors.length)];
			document.body.appendChild(particle);
			particles.push(particle);
		}

		return particles;
	};

	const animateParticles = (particles: HTMLDivElement[]) => {
		const targetX = window.innerWidth;
		const targetY = 0;

		particles.forEach((particle) => {
			const delay = Math.random() * 500;
			const duration = 1000 + Math.random() * 1000;

			const startX = parseFloat(particle.style.left);
			const startY = parseFloat(particle.style.top);

			const distanceX = targetX - startX;
			const distanceY = targetY - startY;

			setTimeout(() => {
				particle.style.transform = `translate(${distanceX}px, ${distanceY}px) rotate(${
					Math.random() * 360
				}deg)`;
				particle.style.opacity = '0';
				particle.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

				setTimeout(() => {
					particle.remove();
				}, duration);
			}, delay);
		});
	};

	return (
		<div className="thanos-snap-container">
			<div
				ref={divRef}
				className={`thanos-snap-div ${
					isDisintegrating ? 'disintegrate' : ''
				}`}
			>
				{children}
			</div>
		</div>
	);
};

export default ThanosSnap;
