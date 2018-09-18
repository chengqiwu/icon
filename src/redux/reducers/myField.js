import {
  SETMYFIELD,
  UPDATEMYFIELD
} from '_redux/actions/myField'

export default function myFieldReducer(state = [], action) {
  switch (action.type) {
  case SETMYFIELD:
    console.log(action)
    return action.fields
  default:
    return state
  }
}