export const allSkills = [
  'HTML',
  'CSS',
  'JavaScript',
  'Node.js',
  'Python',
  'Django',
  'Java',
  'Spring',
  'React',
  'TypeScript',
  'Express',
  'MongoDB'
]

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const MAX_LENGTH = 5

export const getRandomSkills = () => {
  const numberOfSkills = randomInt(1, MAX_LENGTH)
  const skills = []
  while (skills.length < numberOfSkills) {
    const skill = allSkills[randomInt(0, allSkills.length - 1)]
    if (!skills.includes(skill)) {
      skills.push(skill)
    }
  }
  return skills
}
