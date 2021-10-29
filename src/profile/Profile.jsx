import React from 'react';
import DropdownSelect from '../_containers/DropdownSelect';
import CheckSVG from '../_svg/CheckSVG';
import DefaultProfileSVG from '../_svg/DefaultProfileSVG';
import ProfileImage from './ProfileImage';

const BOOKS = [
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
];

const Profile = () => {
	return (
		<>
			<div className='content-container'>
				<br />
				<DropdownSelect
					options={[]}
					value={[]}
					clearable
					labelField='lastFirstName'
					searchBy={[]}
					placeholder='Search'
					className='searchbar'
				/>

				<div className='flex-row' style={{ marginTop: '2rem' }}>
					<div className='flex-column user-profile-image-container'>
						<ProfileImage />
						{/* <button className='main-button'>Follow</button> */}
						<button className='main-button' style={{ margin: '1rem auto 0 auto' }}>
							<CheckSVG />
							Followed
						</button>
					</div>

					{/* Currently Reading */}
					<div className='profile-row-section'>
						<h2>Currently Reading</h2>
						<div>
							<p>The Doors of Stone</p>
							<p>Patrick Rothfuss</p>
						</div>

						<div>
							<p>The Fires of Heaven</p>
							<p>Robert Jordan</p>
						</div>
					</div>

					{/* Shelves */}
					<div className='profile-row-section'>
						<h2>Shelves</h2>
						<div className='shelf-placard-wrapper'>
							<p className='shelf-placard'>Favorites</p>
						</div>
						<div className='shelf-placard-wrapper'>
							<p className='shelf-placard'>Fantasy</p>
						</div>
						<div className='shelf-placard-wrapper'>
							<p className='shelf-placard'>Science Fiction</p>
						</div>
						<div className='shelf-placard-wrapper'>
							<p className='shelf-placard'>Business</p>
						</div>
					</div>

					{/* Stats */}
					<div className='profile-row-section'>
						<h2>Collection</h2>
						<h3>Read</h3>
						<div className='flex-row center'>
							<p>This Year</p>
							<p>18</p>
						</div>
						<div className='flex-row center'>
							<p>All Time</p>
							<p>242</p>
						</div>

						<div className='flex-row center'>
							<h3>To-Read</h3>
							<p>399</p>
						</div>
					</div>
				</div>

				{/* Top Recommendations */}
				<div className='page-section'>
					<h2 className='section-title'>Top Recommendations</h2>
					<div
						className='flex-row center'
						style={{ flexWrap: 'wrap', margin: '0 auto', width: '85rem' }}>
						{/* Book */}
						{BOOKS.map((book) => (
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

				{/* Top Authors */}
				<div className='page-section'>
					<h2 className='section-title' style={{ marginTop: '4rem' }}>
						Top Authors
					</h2>
					<div className='flex-row center'>
						{/* Author */}
						<div className='profile-img-wrapper' style={{ maxWidth: '10rem', margin: '1rem' }}>
							<DefaultProfileSVG className='profile-img' />
						</div>
						{/* Author */}
						<div className='profile-img-wrapper' style={{ maxWidth: '10rem', margin: '1rem' }}>
							<DefaultProfileSVG className='profile-img' />
						</div>
						{/* Author */}
						<div className='profile-img-wrapper' style={{ maxWidth: '10rem', margin: '1rem' }}>
							<DefaultProfileSVG className='profile-img' />
						</div>
						{/* Author */}
						<div className='profile-img-wrapper' style={{ maxWidth: '10rem', margin: '1rem' }}>
							<DefaultProfileSVG className='profile-img' />
						</div>
						{/* Author */}
						<div className='profile-img-wrapper' style={{ maxWidth: '10rem', margin: '1rem' }}>
							<DefaultProfileSVG className='profile-img' />
						</div>
						{/* Author */}
						<div className='profile-img-wrapper' style={{ maxWidth: '10rem', margin: '1rem' }}>
							<DefaultProfileSVG className='profile-img' />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Profile;
