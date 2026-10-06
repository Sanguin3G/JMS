import { describe, expect, it } from 'vitest';
import { ENDINGS, SCENES, resolveEnding, validRoute } from './calibration-story';
describe('Calibration routes',()=>{
 it('makes every ending reachable and resolves all routes deterministically',()=>{
  const found=new Set<string>();
  for(let encoded=0;encoded<4**SCENES.length;encoded++){
   let n=encoded;const route=SCENES.map(()=>{const choice=n%4;n=Math.floor(n/4);return choice;});
   const result=resolveEnding(route);found.add(result.id);
   expect(resolveEnding([...route]).id).toBe(result.id);
  }
  expect([...found].sort()).toEqual(ENDINGS.map(x=>x.id).sort());
 });
 it('rejects malformed saved routes rather than coercing or trusting storage',()=>{
  for(const invalid of [null,{},'[]',[4],[-1],['1'],[0,0,0,0,0,0,0],[NaN]])expect(validRoute(invalid)).toBe(false);
  expect(validRoute([0,1,2])).toBe(true);
  expect(()=>resolveEnding([0,1])).toThrow('Invalid story route');
 });
 it('has paired writing for scenes, responses, souvenirs and endings',()=>{
  const lines=SCENES.flatMap(s=>[s.title,s.place,s.text,...s.choices.flatMap(c=>[c.text,c.reply,c.souvenir])]);
  for(const ending of ENDINGS)lines.push(ending.title,ending.text,ending.reflection);
  for(const line of lines){expect(line.vi.trim().length).toBeGreaterThan(0);expect(line.en.trim().length).toBeGreaterThan(0);expect(line.vi).not.toBe(line.en);}
 });
});
