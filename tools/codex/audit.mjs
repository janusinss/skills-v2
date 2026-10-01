import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceRoot, repoRoot, filesIn, parseSkill, checkSkill, parseYaml, checkOpenai, snapshotSource, slash, json } from './lib.mjs';

export function auditSource() {
  const skillsRoot = path.join(sourceRoot, 'skills');
  const manifests = filesIn(skillsRoot).filter(file => path.basename(file) === 'SKILL.md');
  const skills = manifests.map(file => {
    const relative = slash(path.relative(repoRoot, file));
    try {
      const { frontmatter, body } = parseSkill(fs.readFileSync(file, 'utf8'), relative);
      const metadataPath = path.join(path.dirname(file), 'agents/openai.yaml');
      let metadataErrors = [];
      if (fs.existsSync(metadataPath)) {
        try { metadataErrors = checkOpenai(parseYaml(fs.readFileSync(metadataPath, 'utf8'), metadataPath), frontmatter.name); }
        catch (error) { metadataErrors = [error.message]; }
      }
      return {
        path: relative, name: frontmatter.name,
        topLevel: path.dirname(file) === path.join(skillsRoot, path.basename(path.dirname(file))),
        descriptionCharacters: typeof frontmatter.description === 'string' ? frontmatter.description.length : 0,
        bodyLines: body.split('\n').length,
        hostSpecificPaths: [...new Set((body.match(/(?:~\/)?\.claude\/skills\/[^\s`"')]+/g) || []))],
        extraFields: Object.keys(frontmatter).filter(field => !['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'].includes(field)),
        errors: checkSkill(frontmatter, path.basename(path.dirname(file))),
        hasOpenaiMetadata: fs.existsSync(metadataPath), metadataErrors,
      };
    } catch (error) { return { path: relative, topLevel: path.dirname(path.dirname(file)) === skillsRoot, errors: [error.message] }; }
  });
  const duplicates = Object.fromEntries([...new Set(skills.map(skill => skill.name).filter(Boolean))]
    .map(name => [name, skills.filter(skill => skill.name === name).map(skill => skill.path)]).filter(([, paths]) => paths.length > 1));
  const topLevel = skills.filter(skill => skill.topLevel);
  const lock = JSON.parse(fs.readFileSync(path.join(repoRoot, 'skills-lock.json'), 'utf8'));
  return {
    checkedOn: '2026-10-01', source: '.agents/', snapshot: snapshotSource(),
    summary: {
      topLevelSkills: topLevel.length, totalManifests: skills.length,
      uniqueNames: new Set(skills.map(skill => skill.name).filter(Boolean)).size,
      rules: filesIn(path.join(sourceRoot, 'rules')).filter(file => file.endsWith('.md')).length,
      topLevelDescriptionCharacters: topLevel.reduce((sum, skill) => sum + (skill.descriptionCharacters || 0), 0),
      allDescriptionCharacters: skills.reduce((sum, skill) => sum + (skill.descriptionCharacters || 0), 0),
      skillsWithStrictSchemaErrors: skills.filter(skill => skill.errors.length).length,
      skillsWithValidNamesAndDescriptions: skills.filter(skill => !skill.errors.some(error => error.startsWith('name ') || error.startsWith('description ') || error.includes('missing YAML') || error.includes('frontmatter must'))).length,
      existingOpenaiMetadataFiles: skills.filter(skill => skill.hasOpenaiMetadata).length,
      metadataFilesNeedingUpdates: skills.filter(skill => skill.metadataErrors?.length).length,
      skillsWithClaudePaths: skills.filter(skill => skill.hostSpecificPaths?.length).length,
      lockfileEntries: Object.keys(lock.skills).length,
    }, duplicates, skills,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = auditSource();
  console.log(json({ ...audit.summary, duplicates: audit.duplicates }));
}
