import React from "react";

function SimilarityScoreDisplay({ score, radius, strokeWidth }) {
  // Ensure the score is within the valid range of 0 to 100
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  // Adjusted radius based on stroke width
  const adjustedRadius = radius - strokeWidth / 2;

  // Calculate the circumference of the circle based on the radius
  const circumference = 2 * Math.PI * adjustedRadius;

  // Calculate the strokeDasharray and strokeDashoffset to control the outline
  const strokeDasharray = `${circumference} ${circumference}`;
  let strokeDashoffset =
    circumference - (circumference * normalizedScore) / 100 + 5;

  // basically checking if score > 50
  let strokeDashoffsetLeft = 0;
  if (strokeDashoffset < 0.5 * circumference) {
    strokeDashoffsetLeft = strokeDashoffset;
    strokeDashoffset = circumference / 2;
  }

  // Calculate the rotation angle (90 degrees counterclockwise)
  const rotation = -90;

  // Calculate the gradient IDs based on the score
  const gradientLeftId = `gradient-left-${score}`;
  const gradientRightId = `gradient-right-${score}`;

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientLeftId} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="60%" stopColor="green" />
          <stop offset="100%" stopColor="yellow" />
        </linearGradient>
        <linearGradient id={gradientRightId} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="red" />
          <stop offset="100%" stopColor="yellow" />
        </linearGradient>
      </defs>
      <g transform={`rotate(${rotation} ${radius} ${radius})`}>
        {score === 100 ? (
          // all green circle if score is 100
          <circle
            cx={radius}
            cy={radius}
            r={adjustedRadius} // Adjust for stroke width
            fill="transparent"
            stroke={"green"} // Gradient stroke
            strokeWidth={strokeWidth} // Outline thickness
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffsetLeft}
            strokeLinecap="round"
          />
        ) : (
          <>
            <circle
              cx={radius}
              cy={radius}
              r={adjustedRadius} // Adjust for stroke width
              fill="transparent"
              stroke={
                strokeDashoffsetLeft > 0
                  ? `url(#${gradientLeftId})`
                  : "transparent"
              } // Gradient stroke
              strokeWidth={strokeWidth} // Outline thickness
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffsetLeft}
              strokeLinecap="round"
            />
            <circle
              cx={radius}
              cy={radius}
              r={adjustedRadius} // Adjust for stroke width
              fill="transparent"
              stroke={`url(#${gradientRightId})`} // Gradient stroke
              strokeWidth={strokeWidth} // Outline thickness
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </>
        )}
      </g>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={radius / 2} // Adjust font size based on radius
        fill="white"
      >
        {normalizedScore}
      </text>
    </svg>
  );
}

export default SimilarityScoreDisplay;
