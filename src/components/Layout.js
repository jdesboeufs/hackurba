import { h, Component } from 'preact'
import { bind } from 'decko'
import UrbaViewer from './UrbaViewer'

export default class Layout extends Component {

  @bind
  onChange(event) {
    this.searchAddr(event.target.value)
  }

  searchAddr(addr) {
    fetch(`http://api-adresse.data.gouv.fr/search/?q=${addr}`)
      .then(response => response.json())
      .then(response => {
        if (!response.features || response.features.length === 0) throw new Error('No geocode result')
        return response.features[0]
      })
      .then(result => this.setState({ normalizedAddress: result }))
  }

  shouldComponentUpdate(nextProps, { normalizedAddress}) {
    return normalizedAddress !== this.state.normalizedAddress
  }

  render() {
    return (
      <div class="ui">
        <div class="ui fixed menu">
          <div class="ui container">
            <a href="#" class="header item">HackUrba</a>
            <div class="ui item">
              <div class="ui transparent icon input">
                <input class="prompt large" type="text" placeholder="Saisissez une adresse…" onChange={this.onChange} />
                <i class="search link icon"></i>
              </div>
            </div>
          </div>
        </div>
        <UrbaViewer normalizedAddress={this.state.normalizedAddress} />
      </div>
    )
  }
}
