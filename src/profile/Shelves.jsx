import React, { useEffect, useState } from 'react';
import CaratSVG from '../_svg/CaratSVG';

const BOOKSHELVES = [
	{
		name: 'Test 1',
		books: [
			'knight_shoe_dog.jpeg',
			'sanderson_way_of_kings.jpeg',
			'sanderson_skyward.jpg',
			'rothfuss_name_of_the_wind.jpeg',
			'wildbow_worm.jpeg',
			'isaacson_steve_jobs.jpg',
			'lawhead_paradise_war.jpeg',
			'king_on_writing.jpg',
			'card_speaker_for_the_dead.jpeg',
			'pyle_robin_hood.jpeg',
		],
	},
	{
		name: 'Test 2',
		books: [
			'sanderson_way_of_kings.jpeg',
			'knight_shoe_dog.jpeg',
			'wildbow_worm.jpeg',
			'rothfuss_name_of_the_wind.jpeg',
			'card_speaker_for_the_dead.jpeg',
			'isaacson_steve_jobs.jpg',
			'king_on_writing.jpg',
			'sanderson_skyward.jpg',
			'lawhead_paradise_war.jpeg',
			'pyle_robin_hood.jpeg',
		],
	},
	{
		name: 'Test 3',
		books: [
			'sanderson_skyward.jpg',
			'rothfuss_name_of_the_wind.jpeg',
			'card_speaker_for_the_dead.jpeg',
			'sanderson_way_of_kings.jpeg',
			'wildbow_worm.jpeg',
			'isaacson_steve_jobs.jpg',
			'pyle_robin_hood.jpeg',
			'lawhead_paradise_war.jpeg',
			'king_on_writing.jpg',
			'knight_shoe_dog.jpeg',
		],
	},
];

const Shelves = () => {
	const [shelfIndex, setShelfIndex] = useState(0);
	const [width, setWidth] = useState(0);
	console.log('width:', width);

	const handlePageChange = (direction) => () => {
		if (direction === 'INCREMENT' && shelfIndex < BOOKSHELVES.length - 1) {
			setShelfIndex((prev) => prev + 1);
		}
		if (direction === 'DECREMENT' && shelfIndex > 0) {
			setShelfIndex((prev) => prev - 1);
		}
	};

	useEffect(() => {
		const handleWindowResize = (e) => {
			const containerEl = document.getElementById('page-container');
			console.log('containerEl:', containerEl);
			console.log('containerEl?.clientWidth:', containerEl?.clientWidth);
			setWidth(containerEl?.clientWidth);
		};
		handleWindowResize();

		window.addEventListener('resize', handleWindowResize);

		return () => window.removeEventListener('resize', handleWindowResize);
	}, []);

	return (
		<div className='page-section'>
			<div>
				<h2 className='section-title'>Shelves</h2>
			</div>

			<div className='flex-row center  shelf-row'>
				<button className='shelf-next-button' onClick={handlePageChange('DECREMENT')}>
					<CaratSVG rotate='90' />
				</button>

				<div>
					<div className='shelf-placard-wrapper'>
						<p className='shelf-placard'>{BOOKSHELVES[shelfIndex].name}</p>
					</div>

					<div
						className='flex-row center'
						style={{ flexWrap: 'wrap', margin: '0 auto', width: '85rem' }}>
						{/* Book */}
						{BOOKSHELVES[shelfIndex].books.map((book) => (
							<div className='book-container'>
								<div className='book-wrapper'>
									<img className='book' src={`./${book}`} alt='' />
									<div className='book-spotlight-glow' />
									<div className='book-spotlight-fadeout' />
									<div className='book-ground-glow' />
								</div>
							</div>
						))}
					</div>
				</div>

				<button className='shelf-next-button' onClick={handlePageChange('INCREMENT')}>
					<CaratSVG rotate='-90' />
				</button>
			</div>
		</div>
	);
};

export default Shelves;
