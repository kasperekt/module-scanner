import { add } from './modules1/a1'
import { sub } from './modules2/b1'

console.log('Sub, then add', add(10, sub(20, 10)))