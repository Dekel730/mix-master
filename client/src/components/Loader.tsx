import { useEffect, useRef, useState } from 'react';
import '../Loader.css';
import $ from 'jquery';

const Loader = () => {
	const worker = useRef<NodeJS.Timeout | undefined>(undefined);
	const [loaded, setLoaded] = useState<number>(0);
	const hasRun = useRef<boolean>(false);

	const handleView = () => {
		$('#drink').css('top', 100 - loaded * 0.9 + '%');
		if (loaded === 25) $('#cubes div:nth-child(1)').fadeIn(100);
		if (loaded === 50) $('#cubes div:nth-child(2)').fadeIn(100);
		if (loaded === 75) $('#cubes div:nth-child(3)').fadeIn(100);
		if (loaded === 100) {
			$('#lemon').fadeIn(100);
			$('#straw').fadeIn(300);
			stopLoading();
			setTimeout(startLoading, 1000);
		}
	};

	function increment() {
		setLoaded((prev) => {
			const next = prev + 1;
			return next;
		});
	}

	function startLoading() {
		$('#lemon').hide();
		$('#straw').hide();
		$('#cubes div').hide();
		setLoaded(0);
		if (worker.current) clearInterval(worker.current);
		worker.current = setInterval(increment, 30);
	}
	function stopLoading() {
		if (worker.current) {
			clearInterval(worker.current);
			worker.current = undefined;
		}
	}

	useEffect(() => {
		handleView();
	}, [loaded]);

	useEffect(() => {
		if (!hasRun.current) {
			hasRun.current = true;
			return;
		}
		startLoading();

		return () => {
			if (worker.current) {
				clearInterval(worker.current);
				worker.current = undefined;
			}
		};
	}, []);
	return (
		<div id="loader">
			<div id="lemon"></div>
			<div id="straw"></div>
			<div id="glass">
				<div id="cubes">
					<div></div>
					<div></div>
					<div></div>
				</div>
				<div id="drink"></div>
			</div>
			<div id="coaster"></div>
		</div>
	);
};

export default Loader;
