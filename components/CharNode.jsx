import React from 'react';

const CharNode = React.memo(({ char, status }) => {
    let colorClass = 'text-muted';

    if (status === 'correct') {
        colorClass = 'text-correct';
    } else if (status === 'incorrect') {
        // Spaces show as a background highlight; other characters show as red text.
        colorClass = char === ' ' ? 'bg-incorrect/20' : 'text-incorrect';
    }

    return (
        <span style={{ fontSize: 'var(--char-font-size)' }} className={`font-mono ${colorClass}`}>
            {char}
        </span>
    );
});

CharNode.displayName = 'CharNode';

export default CharNode;
