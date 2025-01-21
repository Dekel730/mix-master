import { useEffect, useRef, useState } from 'react';
import './Loader.css';
import $ from 'jquery';

const Loader = () => {
	const [worker, setWorker] = useState<
		ReturnType<typeof setInterval> | undefined
	>(undefined);
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
		console.log(loaded);
		setLoaded((prev) => prev + 1);
	}

	function startLoading() {
		$('#lemon').hide();
		$('#straw').hide();
		$('#cubes div').hide();
		setLoaded(0);
		setWorker(setInterval(increment, 30));
	}
	function stopLoading() {
		clearInterval(worker);
	}

	useEffect(() => {
		handleView();
	}, [loaded]);

	useEffect(() => {
		if (hasRun.current) {
			return;
		}
		hasRun.current = true;
		startLoading();
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
