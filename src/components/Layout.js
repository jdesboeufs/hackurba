import { h, Component } from 'preact'
import { bind } from 'decko'
import UrbaViewer from './UrbaViewer'

const examples = [
  '371 Route de la Côte 74290 Alex',
  '9 Route de Sogny 51520 Sarry'
]

function Examples({ searchAddr }) {
  return (
    <div style="margin-top: 2em">
      <h4 class="ui header">
        Exemples
        <div class="sub header">Les adresses ci-dessous sont là pour vous aider.</div>
      </h4>
      <ul>
        {examples.map(ex => <li><a href="#" onClick={() => searchAddr(ex)}>{ex}</a></li>)}
      </ul>
    </div>
  )
}

export default class Layout extends Component {

  @bind
  onChange(event) {
    this.searchAddr(event.target.value)
  }

  @bind
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
    fetch(`https://geo.api.gouv.fr/gpu?lon=${lon}&lat=${lat}&dist=50`)
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
            <a href="/hackurba" class="header item">HackUrba</a>
          </div>
        </div>
        <div style="margin-top: 5em" class="ui main text container">
          <h1 class="ui header">
            Règles d'urbanisme applicables à une adresse
            <div class="sub header">Commencez par saisir une adresse dans le champs suivant.</div>
          </h1>
          <p></p>
          <div class="ui search">
            <div class="ui icon input">
              <input class="prompt big" size="50" type="text" placeholder="Saisissez une adresse…" onChange={this.onChange} />
              <i class="search icon"></i>
            </div>
          </div>
          {this.state.normalizedAddress ? null : <Examples searchAddr={this.searchAddr} />}
        </div>
        <UrbaViewer normalizedAddress={this.state.normalizedAddress} gpuInfos={this.state.gpuInfos} communeInfos={this.state.communeInfos} />
      </div>
    )
  }
}
