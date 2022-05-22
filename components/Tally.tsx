import _ from "lodash"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import styles from "../styles/Tally.module.scss"
import seedrandom from 'seedrandom';
import random, { Random } from 'random';
import { Typography } from "@mui/material";
import animateSvg from 'animate-svg'

// NOT setting a seed would cause the following behavior:
// - SSR would mismatch with the client hydration (causing an error wall)
// - the lines would be different every time you render the page (now they
//   are MOSTLY the same, differing only when doing stuff between renders)
random.use(seedrandom('123') as any)

export function TallyCounter({
  value,
  showCount = false
}: {
  value: number
  showCount?: boolean
}) {
  const counts = useMemo(() =>
    _.times(Math.ceil(value / 5), i => Math.min(value - i * 5, 5))
    , [value])
  return <>
    <span className={styles.container}>
      {
        counts.map((count, i) => <TallyCounterSingle
          key={i}
          value={count}
          random={random}
          randomness={i}
        />)
      }
      { showCount && !!value && <Typography variant="subtitle2" sx={{
        fontSize: '1.2em',
        color: '#777',
      }}>{ value }</Typography> }
    </span>
  </>
}
export function TallyCounterSingle({
  value,
  randomness = 0,
  random,
}: {
  value: number
  randomness?: number
  random: Random
}) {
  return <span>
    {_.times(Math.min(value, 4), i => <TallyLine key={i} randomness={i + randomness} random={random} />)}
    {value > 4 && <TallyLineOver randomness={4 + randomness} random={random} />}
  </span>
}

const em = (v: number | string) => `${v}em`
const rCalc = (random: Random, a: number, b: number, randomness: number) =>
  random.normal(a, b + randomness < 15 ? randomness * 0.06 : Math.min(randomness * 0.2, 2))().toFixed(2)

function TallyLine({
  randomness = 0,
  random,
}: {
  randomness?: number
  random: Random
}) {
  const ref = useRef<SVGGeometryElement>(null)
  const r = useCallback((a: number, b: number) => rCalc(random, a, b, randomness), [ random, randomness ]);

  (typeof window !== 'undefined' ? useLayoutEffect : useEffect)(() => {
    if (ref.current) {
      animateSvg(ref.current, _.clamp(
        random.normal(0.1, Math.min(randomness * 0.005, 0.2))(),
        0.06,
        0.12
      ), false)
    }
  }, [ ])

  const [
    x1,
    y1,
    x2,
    y2,
  ] = useMemo(() => [
    r(0, 0),
    r(-0, 0),
    r(0.6, 0),
    r(2.1, 0),
  ], [ r ]);
  return <svg width='0.7em' height='2em' style={{ overflow: 'visible' }}>
    <line
      ref={ref as any}
      x1={em(x1)}
      y1={em(y1)}
      x2={em(x2)}
      y2={em(y2)}
      strokeWidth={em(0.15)}
      stroke='white'
      strokeDasharray={0}
    />
  </svg>
}
function TallyLineOver({
  randomness = 0,
  random,
}: {
  randomness?: number
  random: Random
}) {
  const ref = useRef<SVGGeometryElement>(null)
  const r = useCallback((a: number, b: number) => rCalc(random, a, b, randomness), [ random, randomness ]);

  (typeof window !== 'undefined' ? useLayoutEffect : useEffect)(() => {
    if (ref.current) {
      animateSvg(ref.current, _.clamp(
        random.normal(0.1, Math.min(randomness * 0.005, 0.2))(),
        0.06,
        0.12
      ), false)
    }
  }, [ ])

  const [
    x1,
    y1,
    x2,
    y2,
  ] = useMemo(() => [
    r(0.1, 0),
    r(0.3, 0),
    r(-3, 0),
    r(1.7, 0),
  ], [ r ]);
  return <svg width='0.2em' height='2em' style={{ overflow: 'visible' }}>
    <line
      ref={ref as any}
      x1={em(x1)}
      y1={em(y1)}
      x2={em(x2)}
      y2={em(y2)}
      strokeWidth={em(0.15)}
      stroke='white'
    />
  </svg>
}