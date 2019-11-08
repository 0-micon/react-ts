import React from 'react';
import { suitFullNameOf, playNameOf } from '../core/deck';

export interface CardProps {
  cardIndex: number;
}

const Card: React.FC<CardProps> = (props: CardProps) => {
  const index = props.cardIndex;
  return (
    <div className={'card ' + suitFullNameOf(index)}>
      {playNameOf(index)}
    </div>
  );
};

export default Card;
