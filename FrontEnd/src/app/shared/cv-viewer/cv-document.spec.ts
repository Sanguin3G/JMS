import { describe, expect, it } from 'vitest';
import { cvItems, normalizeCv } from './cv-document';
describe('shared CV document',()=>{
 it('reads Pascal-case application snapshots and camel-case editable CVs',()=>{
  const snapshot=normalizeCv({DisplayName:'An',CVTitle:'Original title',DOB:'1998-04-17',Font:'Verdana',Skill:'[{"Title":"Angular","SkillDescription":"Built accessible forms"}]',JobExperience:[{ComapanyName:'Studio',Position:'Engineer'}],Theme:8});
  expect(snapshot.skills[0]).toMatchObject({title:'Angular',skillDescription:'Built accessible forms'});
  expect(snapshot.experiences[0]['comapanyName']).toBe('Studio');
  expect(snapshot.displayName).toBe('An');expect(snapshot.theme).toBe(8);
  expect(snapshot.title).toBe('Original title');expect(snapshot.dob).toBe('1998-04-17');expect(snapshot.font).toBe('Verdana');
  expect(normalizeCv({displayName:'An',skills:snapshot.skills}).skills).toEqual(snapshot.skills);
 });
 it('handles empty, placeholder and corrupt sections without indexing them',()=>{
  for(const value of [null,undefined,'broken','{}',[{}],[{Id:1}],[]])expect(cvItems(value)).toEqual([]);
  const cv=normalizeCv({theme:99,font:'unsafe font',genderDisplay:''});
  expect(cv.theme).toBe(6);expect(cv.font).toBe('Arial');expect(cv.gender).toBe('');
  expect(cv.skills).toEqual([]);expect(cv.educations).toEqual([]);
 });
});
