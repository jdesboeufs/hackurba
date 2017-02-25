import { h, Component } from 'preact'

export default class UrbaViewer extends Component {
  render({ normalizedAddress }) {
    if (!normalizedAddress) return null
    return (
      <div class="ui main text container">
        <h1 class="ui header">Règles d'urbanisme</h1>
        <div>Analyse pour : <strong>{normalizedAddress.properties.label}</strong></div>
      </div>
    )
  }
}
