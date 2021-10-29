import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useMemo,
	useImperativeHandle,
} from 'react';

import CloseSVG from '../_svg/CloseSVG';
import BookSVG from '../_svg/BookSVG';

import Fuse from 'fuse.js';
import { VariableSizeList as List } from 'react-window';
import { getRootSize } from '../utils/utils';

// TODO - eventually configure for use with an array of primitives (numbers / strings)
// Or build a simple duplicate that just uses the same styles but strips out the unnecessary stuff?
// Add fuse.js into that too for better matching

const DropdownSelect = React.forwardRef(
	(
		{
			labelField = '', // REQUIRED
			className: additionalClass = '',
			options: allOptions,
			value = {}, // NOTE: change the dropdown selects to use VALUE instead of VALUE"S"
			style = {},
			searchable = true,
			searchBy = labelField, // Either a single string or array of strings
			placeholder = '',
			disabled = false,
			required = false,
			clearable = true, // On clear, returns [] or {}
			autoFocus = false,
			visibleResults = 5,
			onChange = () => null,
			extraRowOptions = null, // If searchBy fields are keys, will render an extra row. Each has display and formatFn props.
			iconProps = {}, // { key: status, value: 'Client' }
			additionalProps = {},
			useCtrlKShortcut = false,
		},
		ref
	) => {
		// STATE
		const [searchText, setSearchText] = useState('');
		const [options, setOptions] = useState([]);
		// const [allOptions, setAllOptions] = useState(originalOptions);

		const [focused, setFocused] = useState(false);
		const [focusedIndex, setFocusedIndex] = useState(null);
		const [containerHeight, setContainerHeight] = useState(0);
		const [containerWidth, setContainerWidth] = useState(0);
		const [rootSize, setRootSize] = useState(17);
		const [shouldUpdateFuse, setShouldUpdateFuse] = useState(false);
		const [rowHeights, setRowHeights] = useState([]);

		const [shouldWrapOption] = useState(Array.isArray(value));
		const [selectedOption, setSelectedOption] = useState({});

		// REFS
		const fuseRef = useRef(null);
		const containerRef = useRef(null);
		const listRef = useRef(null);
		const inputRef = useRef(null);

		// Syncs the parent ref with the inputRef
		useImperativeHandle(ref, () => inputRef.current);

		const focusedRef = useRef(false);

		const updateFuse = useCallback(() => {
			const fuseOptions = {
				// isCaseSensitive: false,
				includeScore: true,
				includeMatches: true,
				useExtendedSearch: true, // Means spaces are treated as AND for searches
				ignoreFieldNorm: true, // Ignoring means the length of the field doesn't affect weight
				ignoreLocation: true, // Ignoring means results anywhere in the string have the same weight
				threshold: 0.2, // Smaller is more restrictive. 0.2 is enough to find Marbert with the typo Marbet.
				// Search in `author` and in `tags` array
				keys: [...(typeof searchBy === 'string' ? [searchBy] : searchBy)],
			};

			// Recreate the fuse object. Use a ref for focused to prevent recreation on focus.
			if (!fuseRef.current || !focusedRef.current) {
				fuseRef.current = new Fuse(allOptions ?? [], fuseOptions);
				setShouldUpdateFuse(false);
			} else {
				// If we were prevented from updating fuse because of focus, flag for update
				setShouldUpdateFuse(true);
			}
		}, [allOptions, searchBy]);

		// Create and update FUSE object
		useEffect(() => {
			updateFuse();
		}, [updateFuse]);

		// Run delayed FUSE updates when focus toggled off
		useEffect(() => {
			if (shouldUpdateFuse) {
				updateFuse();
			}
		}, [shouldUpdateFuse, focused, updateFuse]);

		// Sets the selectedOption based on the value prop
		useEffect(() => {
			// For backwards compatiblity
			if (Array.isArray(value)) {
				setSelectedOption(value[0] ?? {});
			} else {
				setSelectedOption(value ?? {});
			}
		}, [value]);

		// Updates the selectedOption and calls the onChange callback
		const updateSelectedOption = useCallback(
			(value) => {
				let newValue = { ...value };

				setSelectedOption(newValue);
				onChange(shouldWrapOption ? [newValue] : newValue);
				setFocused(false);
			},
			[onChange, shouldWrapOption]
		);

		// Flag used to handle enter key presses (either boolean or index)
		const [shouldSelect, setShouldSelect] = useState(false);
		useEffect(() => {
			if (
				shouldSelect !== false &&
				(focusedIndex !== null || typeof shouldSelect !== 'boolean')
			) {
				setShouldSelect(false);

				// Pull the selected option
				let newSelected;
				if (typeof shouldSelect === 'boolean') {
					// If just provided TRUE, use the focused index (selected with Enter key)
					newSelected = options[focusedIndex];
				} else {
					// Otherwise, provided a specific index to use
					newSelected = options[Number(shouldSelect)];
				}

				// If no results, don't select the new value
				if (newSelected._noResults) return;

				updateSelectedOption(newSelected);

				// inputRef.current.focus(); // Is this needed? Prevents Tab press from advancing.
				listRef.current.scrollToItem(0);
				setFocusedIndex(null);
				setSearchText('');
			}
		}, [shouldSelect, focusedIndex, options, updateSelectedOption]);

		// SEARCH
		useEffect(() => {
			if (searchText) {
				// Fuse search
				const results = fuseRef.current.search(searchText);

				// Reformat the fuse results to match our items
				const newFiltered = results.map((result) => ({
					...result.item,
					_matches: result.matches,
				}));

				// Update the row heights, accounting for results with extra rows
				const baseHeight = (rootSize ?? 16) * 2;
				const expandedHeight = (rootSize ?? 16) * 3;
				const newRowHeights = (newFiltered.length ? newFiltered : ['No Results']).map(
					(item) => {
						return extraRowOptions?.[item._matches?.[0]?.key] ? expandedHeight : baseHeight;
					}
				);
				setRowHeights(newRowHeights);

				// Set the results
				if (newFiltered.length > 0) {
					setOptions(newFiltered);
				} else {
					// No results
					setOptions([
						{
							[labelField]: 'No Results',
							_noResults: true,
						},
					]);
				}
			} else {
				// Restore all options

				const baseHeight = (rootSize ?? 16) * 2;
				const newRowHeights = (allOptions ?? []).map(() => baseHeight);
				setRowHeights(newRowHeights);

				setOptions(allOptions ?? []);
			}
		}, [searchText, allOptions, labelField, rootSize, extraRowOptions]);

		// EVENT LISTENER for arrow keys / enter
		// NOTE - disable listener when box isn't open (so it's not always running on the page)
		useEffect(() => {
			const handleArrowKeys = (e, direction) => {
				e.preventDefault();
				setFocused(true);

				// Update the focused option
				setFocusedIndex((prev) => {
					let newIndex;

					// Compute the next index
					if (direction === 'UP') {
						// UP
						if (prev === 0) newIndex = null;
						else if (prev === null) newIndex = options.length - 1;
						else newIndex = prev - 1;
					} else {
						// DOWN
						if (prev === options.length - 1) newIndex = null;
						else if (prev === null) newIndex = 0;
						else newIndex = prev + 1;
					}

					// Scroll to the active index or top of list
					listRef.current.scrollToItem(newIndex ?? 0);

					return newIndex;
				});
			};

			const handleEnter = () => {
				setShouldSelect(true);
			};

			const handleEscape = () => {
				inputRef.current.blur();
			};

			const handleKeyDown = (e) => {
				if (e.key === 'ArrowUp') handleArrowKeys(e, 'UP');
				else if (e.key === 'ArrowDown') handleArrowKeys(e, 'DOWN');
				else if (e.key === 'Enter' || e.key === 'Tab') handleEnter();
				else if (e.key === 'Escape') handleEscape();
				else if (!searchable) e.preventDefault();
			};

			if (focused) document.addEventListener('keydown', handleKeyDown);

			return () => {
				if (focused) document.removeEventListener('keydown', handleKeyDown);
			};
		}, [focused, options, searchable]);

		// Clear the focused index on close
		useEffect(() => {
			!focused && setFocusedIndex(null);
			focusedRef.current = focused;
		}, [focused]);

		// Root size calculation
		useLayoutEffect(() => {
			const rect = containerRef.current.getBoundingClientRect();
			setContainerHeight(rect.height);
			setContainerWidth(rect.width);

			setRootSize(getRootSize());
			// Recompute size when opening/closing
		}, [focused]);

		// ITEM COMPONENT
		const DropdownItem = useCallback(
			({ style, index }) => {
				const matchingKey = options[index]?._matches?.[0]?.key;
				const matchingValue = options[index]?._matches?.[0]?.value;
				const hasIcon = iconProps.key && options[index][iconProps.key] === iconProps.value;

				return (
					<div
						className={
							'dropdown-select-options-item' + (focusedIndex === index ? ' active' : '')
						}
						style={{
							...style,
							width: '100%',
							whiteSpace: 'nowrap',
						}}
						onMouseDown={(e) => e.preventDefault()}
						onClick={(e) => {
							e.preventDefault();
							setShouldSelect(index);
						}}>
						<p
							className='dropdown-select-options-item-title flex-row center'
							style={extraRowOptions?.[matchingKey] ? { fontWeight: 'bold' } : {}}>
							{hasIcon ? <BookSVG /> : null}
							{options[index][labelField]}
						</p>
						{extraRowOptions?.[matchingKey] &&
							(extraRowOptions[matchingKey]?.formatFn ? (
								<p className='extra-row'>
									{extraRowOptions[matchingKey].formatFn(matchingValue)}
								</p>
							) : (
								<p className='extra-row'>{matchingValue}</p>
							))}
					</div>
				);
			},
			[options, iconProps, focusedIndex, extraRowOptions, labelField]
		);

		// Function used by react-window to calculate each row's height
		const getRowHeight = useCallback(
			(index) => {
				return rowHeights[index];
			},
			[rowHeights]
		);

		// Update row heights after they have changed
		useLayoutEffect(() => {
			listRef.current && listRef.current.resetAfterIndex(0);
		}, [rowHeights]);

		// Shortcut listener
		useLayoutEffect(() => {
			// Handler function
			const handleFocusInput = (e) => {
				if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
					e.preventDefault();
					inputRef.current.focus();
					// return false; // didn't work to prevent chrome from intercepting
				}
			};

			// Add event listener
			if (useCtrlKShortcut) {
				window.addEventListener('keydown', handleFocusInput);
			}

			// Remove the listener on unmount
			return () => {
				if (useCtrlKShortcut) {
					window.removeEventListener('keydown', handleFocusInput);
				}
			};
		}, [useCtrlKShortcut]);

		// Builds the placeholder text
		const placeholderText = useMemo(() => {
			if (selectedOption[labelField]) {
				return selectedOption[labelField];
			}

			const shortcutText = useCtrlKShortcut ? ' (ctrl + k)' : '';

			if (placeholder) {
				return placeholder + shortcutText;
			}

			return (searchable ? 'Search...' : 'Select One') + shortcutText;
		}, [labelField, placeholder, searchable, selectedOption, useCtrlKShortcut]);

		return (
			<div
				className={'dropdown-select-container ' + additionalClass}
				ref={containerRef}
				{...additionalProps}
				style={{
					...{ backgroundColor: disabled ? 'rgba(239, 239, 239, 0.3)' : 'transparent' },
					...style,
				}}>
				{/* VALIDATION */}
				<input
					required={required}
					className='dropdown-select-hidden-input'
					value={selectedOption[labelField] ?? ''}
					tabIndex={-1}
					onChange={() => {}}
				/>

				{/* INPUT */}
				<input
					disabled={disabled}
					ref={inputRef}
					autoFocus={autoFocus}
					className={
						'dropdown-select-input' + (selectedOption[labelField] ? ' display-selection' : '')
					}
					style={{
						caratColor: !searchable ? 'transparent' : 'auto',
						backgroundColor: 'transparent',
					}}
					placeholder={placeholderText}
					value={searchText}
					onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} // Prevents form submission
					onChange={(e) => {
						setFocusedIndex(0);
						setSearchText(e.target.value);
						setFocused(true);
					}}
					onFocus={() => setFocused(true)}
					onBlur={() => {
						setFocused(false);
						setSearchText('');
					}}
					onClick={() => setFocused(true)}
				/>

				{/* CLEAR */}
				{clearable && (
					<span
						className='dropdown-select-close-button'
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => {
							if (disabled) return;
							setSearchText('');
							setSelectedOption({});
							onChange(shouldWrapOption ? [] : {});
						}}>
						<CloseSVG />
					</span>
				)}

				{/* OPTIONS */}
				{focused && (
					<div
						className='dropdown-select-options-wrapper'
						style={{ top: `${containerHeight + 5}px` }}>
						<List
							style={{ overflowX: 'hidden' }}
							ref={listRef}
							height={
								rowHeights.slice(0, visibleResults).reduce((acc, row) => acc + row, 0) +
								(rowHeights.length > visibleResults ? rootSize : 0)

								// rowHeights.length > visibleResults ?
								// rowHeights.slice(0, visibleResults).reduce((acc, row) => acc + row, 0) + rootSize :
								// Math.min(
								// rowHeights.slice(0, visibleResults * 2).reduce((acc, row) => acc + row, 0),
								// // rootSize * 2 * options.length,
								// rootSize * 2 * (visibleResults + 0.5)
								// )
							}
							itemCount={options.length}
							itemSize={getRowHeight}
							width={containerWidth - 3}>
							{DropdownItem}
						</List>
					</div>
				)}
			</div>
		);
	}
);

export default DropdownSelect;
