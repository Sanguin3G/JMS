export interface CvSectionItem { [key:string]: unknown; }
export interface CvDocument {
 displayName:string; title:string; email:string; phone:string; address:string; dob:string; gender:string;
 avatar:string; goal:string; category:string; level:string; employment:string; theme:number; font:string;
 skills:CvSectionItem[]; educations:CvSectionItem[]; experiences:CvSectionItem[]; projects:CvSectionItem[]; certificates:CvSectionItem[]; awards:CvSectionItem[];
}
function text(value:unknown):string { return typeof value === 'string' || typeof value === 'number' ? String(value) : ''; }
function object(value:unknown):CvSectionItem {
 if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
 return Object.fromEntries(Object.entries(value).map(([key,item]) => [
  key.replace(/^[A-Z]+(?=[A-Z][a-z]|$)/,prefix=>prefix.toLowerCase()).replace(/^[A-Z]/,first=>first.toLowerCase()),item
 ]));
}
export function cvItems(value:unknown):CvSectionItem[] {
 if (typeof value === 'string') { try { value = JSON.parse(value); } catch { return []; } }
 if (!Array.isArray(value)) return [];
 return value.map(object).filter(item => Object.entries(item).some(([key,value]) => !/^(id|.*Id)$/.test(key) && typeof value === 'string' && value.trim()));
}
export function normalizeCv(value:unknown):CvDocument {
 const cv=object(value);
 const theme=Number(cv['theme']);
 return {
 displayName:text(cv['displayName']),title:text(cv['cvTitle']),email:text(cv['displayEmail']),phone:text(cv['phone']),
 address:text(cv['address']),dob:text(cv['dob']),gender:text(cv['genderDisplay']),avatar:text(cv['avatarURL']),
 goal:text(cv['careerGoal']),category:text(cv['categoryName']),level:text(cv['levelTitle']),employment:text(cv['employmentTypeName']),
 theme:Number.isInteger(theme)&&theme>=0&&theme<=8?theme:6,
 font:['Arial','Helvetica','Georgia','Times New Roman','Sans-serif','Monospace','Courier','Courier New','Verdana'].includes(text(cv['font']))?text(cv['font']):'Arial',
 skills:cvItems(cv['skills']??cv['skill']),educations:cvItems(cv['educations']??cv['education']),
 experiences:cvItems(cv['jobExperiences']??cv['jobExperience']),projects:cvItems(cv['projects']??cv['project']),
 certificates:cvItems(cv['certificates']??cv['certificate']),awards:cvItems(cv['awards']??cv['award'])
 };
}

