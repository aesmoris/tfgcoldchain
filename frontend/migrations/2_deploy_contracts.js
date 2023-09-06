const CreacionCadena = artifacts.require('CreacionCadena')
const GestionCadena = artifacts.require('GestionCadena')
const FinCadena = artifacts.require('FinCadena')

module.exports = async function(deployer) {

    //Deploy CreacionCadena
    await deployer.deploy(CreacionCadena)
    const creacioncadena = await CreacionCadena.deployed()

    //Deploy GestionCadena
    await deployer.deploy(GestionCadena, creacioncadena.address)
    const gestioncadena = await GestionCadena.deployed()

    //Deploy FinCadena
    await deployer.deploy(FinCadena, creacioncadena.address)
    const fincadena = await FinCadena.deployed()
}