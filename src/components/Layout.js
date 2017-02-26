import { h, Component } from 'preact'
import { bind } from 'decko'
import UrbaViewer from './UrbaViewer'

export default class Layout extends Component {

  @bind
  onChange(event) {
    this.searchAddr(event.target.value)
  }

  // Example: 371 Route de la Côte 74290 Alex

  searchAddr(addr) {
    fetch(`https://api-adresse.data.gouv.fr/search/?q=${addr}`)
      .then(response => response.json())
      .then(response => {
        if (!response.features || response.features.length === 0) throw new Error('No geocode result')
        return response.features[0]
      })
      .then(result => {
        this.fetchGPUInfos(result.geometry.coordinates[1], result.geometry.coordinates[0])
        this.fetchCommuneInfos(result.properties.citycode)
        this.setState({ normalizedAddress: result })
      })
  }

  fetchGPUInfos(lat, lon) {
    fetch(`http://stmaur.cquest.org/gpu?lon=${lon}&lat=${lat}&dist=50`)
      .then(response => response.json())
      .then(response => {
        if (!response.features || response.features.length === 0) return []
        return response.features
      })
      .then(result => this.setState({ gpuInfos: result }))
  }

  fetchCommuneInfos(code) {
    fetch(`https://geo.api.gouv.fr/communes/${code}?fields=nom,code,population,departement,region,codesPostaux`)
      .then(response => response.json())
      .then(result => this.setState({ communeInfos: result }))
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
        <div class="ui main text container">
          <h2>Exemples</h2>
          <ul>
            <li>371 Route de la Côte 74290 Alex</li>
          </ul>
        </div>
        <UrbaViewer normalizedAddress={this.state.normalizedAddress} gpuInfos={this.state.gpuInfos} communeInfos={this.state.communeInfos} />
      </div>
    )
  }
}
