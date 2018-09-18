import { UPDATE } from '_redux/actions/season'
export default function plantingSeason(state = [], action) {
  switch (action.type) {
  case UPDATE:
    return action.season
  default:
    return state
  }
}