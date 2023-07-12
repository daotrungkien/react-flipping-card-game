import { useState } from 'react';


const NUM_PAIRS = 9;
const POSSIBLE_CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].map(
	a => ['♢', '♣', '♤', '♥'].map(b => a + b)).flat();


const CARD_STATE_NOT_FLIPPED = 1;
const CARD_STATE_FLIPPED = 2;
const CARD_STATE_MATCHED = 3;


function generateCards(numPairs) {
	const possibleCards = [...POSSIBLE_CARDS];
	const cards = [];

	for (let i = 0; i < numPairs; i++) {
		const t = Math.floor(Math.random() * possibleCards.length);
		cards.push(possibleCards[t]);
		cards.push(possibleCards[t]);
		possibleCards.splice(t, 1);
	}

	const shuffledCards = [];
	while (cards.length > 0) {
		const t = Math.floor(Math.random() * cards.length);
		shuffledCards.push(cards[t]);
		cards.splice(t, 1);
	}

	return shuffledCards;
}


function Card({value, state, handleClick}) {
	return <div className={
			state === CARD_STATE_MATCHED ? 'card matched' :
			state === CARD_STATE_FLIPPED ? 'card flipped' : 'card'
		}
		onClick={handleClick}
	>
		{state !== CARD_STATE_NOT_FLIPPED && <div className="card-text">{value}</div>}
	</div>
}



export default function Game() {
	const [cardValues, setCardValues] = useState(generateCards(NUM_PAIRS));
	const [cardStates, setCardStates] = useState(Array(NUM_PAIRS * 2).fill(CARD_STATE_NOT_FLIPPED));
	const [bestScore, setBestScore] = useState(null);
	const [trials, setTrials] = useState(0);
	const [matchedPairs, setMatchedPairs] = useState(0);

	const handleNewGame = () => {
		setCardValues(generateCards(NUM_PAIRS));
		setCardStates(Array(NUM_PAIRS * 2).fill(CARD_STATE_NOT_FLIPPED));
		setTrials(0);
		setMatchedPairs(0);
	}

	const handleCardClick = (i) => {
		// consider only un-flipped cards
		if (cardStates[i] !== CARD_STATE_NOT_FLIPPED) return;

		// number of already-flipped cards
		const lastFlippedCount = cardStates.filter(e => e === CARD_STATE_FLIPPED).length;

		// no more than 2 flipped cards at a time
		if (lastFlippedCount === 2) return;

		const newCardStates = [...cardStates];
		newCardStates[i] = CARD_STATE_FLIPPED;

		if (lastFlippedCount === 1) {
			setTrials(trials + 1);

			// index of last flipped card
			const lastFlipped = cardStates.findIndex(e => e === CARD_STATE_FLIPPED);

			if (cardValues[lastFlipped] === cardValues[i]) {	// cards matched
				newCardStates[lastFlipped] = newCardStates[i] = CARD_STATE_MATCHED;
				setCardStates(newCardStates);
				setMatchedPairs(matchedPairs + 1);

				// game finished
				if (matchedPairs + 1 === NUM_PAIRS && (bestScore === null || bestScore > trials + 1))
					setBestScore(trials + 1);

			} else {	// cards not matched
				setTimeout(() => {
					newCardStates[lastFlipped] = newCardStates[i] = CARD_STATE_NOT_FLIPPED;
					setCardStates([...newCardStates]);
				}, 1000);
			}
		}

		setCardStates(newCardStates);
	}

	return <div className="game">
		<div className="info">
			Flipping Cards
		</div>

		<div className="status">
			<p>Best score: {bestScore ?? '(Not available)'}</p>
			<p>Trials: {trials} • Matched: {matchedPairs}</p>
			<p><button onClick={handleNewGame}>New game</button></p>
		</div>
		
		<div className="board">
			{cardValues.map((cardValue, cardIdx) =>
				<Card key={cardIdx}
					value={cardValue}
					state={cardStates[cardIdx]}
					handleClick = {() => handleCardClick(cardIdx)}
				/>)}
		</div>
	</div>
}
