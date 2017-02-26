import { h, Component } from 'preact'
import groupBy from 'lodash/groupBy'
import { inside, point } from '@turf/turf'

function Info({ geometry: { type }, properties: { libelle, typeinf } }) {
  return <li>[{type}] {libelle} ({typeinf})</li>
}

function InfoList({ items }) {
  return <ul>{items.map(item => <Info {...item} />)}</ul>
}

function Prescription({ geometry: { type }, properties: { libelle } }) {
  return <li>[{type}] {libelle}</li>
}

function PrescriptionList({ items }) {
  return <ul>{items.map(item => <Prescription {...item} />)}</ul>
}

const libelleZone = {
  '00': 'Sans objet ou non encore définie dans le règlement',
  '01': 'Habitat',
  '02': 'Activité',
  '03': 'Mixte habitat/activité',
  '04': 'Loisirs et tourisme',
  '05': 'Équipement',
  '07': 'Activités agricoles',
  '08': 'Espace naturel',
  '09': 'Espace remarquable (littoral ou montagne)',
  '10': 'Secteur de carrière',
  '99': 'Autre'
}

function Zone({ destdomi, typezone }) {
  const libelleDestination = destdomi ? libelleZone[destdomi] : 'Non renseigné'
  return (
    <ul>
      <li>Type de zone : {typezone}</li>
      <li>Destination principale : {libelleDestination}</li>
    </ul>
  )
}

function CommuneInfos({ nom, code, codesPostaux, population, departement, region }) {
  return (
    <ul>
      <li>Nom : {nom}</li>
      <li>Code INSEE : {code}</li>
      <li>Codes postaux : {codesPostaux.join(', ')}</li>
      <li>Population : {population}</li>
      <li>Département : {departement.nom}</li>
      <li>Région : {region.nom}</li>
    </ul>
  )
}

export default class UrbaViewer extends Component {
  render({ normalizedAddress, gpuInfos, communeInfos }) {
    if (!normalizedAddress || !gpuInfos) return null

    const parsedInfos = groupBy(gpuInfos, 'properties.layer')
    const zone = (parsedInfos.zone_urba || []).find(z => inside(normalizedAddress, z))

    return (
      <div class="ui main text container">
        <h1 class="ui header">Règles d'urbanisme</h1>
        <div>Analyse pour : <strong>{normalizedAddress.properties.label}</strong></div>
        <h2>Zonage (PLU)</h2>
        {zone ? <Zone {...zone.properties} /> : <p>Vide</p>}
        <h2>Prescriptions</h2>
        {parsedInfos.prescription ? <PrescriptionList items={parsedInfos.prescription} /> : <p>Aucune prescription à cette adresse</p>}
        <h2>Informations complémentaires</h2>
        {parsedInfos.info ? <InfoList items={parsedInfos.info} /> : <p>Aucune information recensée</p>}
        <h2>Commune</h2>
        <CommuneInfos {...communeInfos} />
      </div>
    )
  }
}
