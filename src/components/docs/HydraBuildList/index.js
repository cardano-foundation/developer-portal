import React from "react";

export const BuildLink = ({ children, id }) => (
    <a href={"https://hydra.iohk.io/build/" + id}>{children}</a>
);

export const BuildListItem = ({ children, id }) => (
    <li><BuildLink id={id}>{children}</BuildLink></li>
);

class HydraBuildList extends React.Component {
    constructor({ latest, linux, macos, win64 }) {
        super()
        this.state = {
            isCurrent: false,
            hasErrors: false,
            latest: latest,
            linux: linux,
            macos: macos,
            win64: win64
        };
    }
    componentDidMount() {
        fetch('https://api.github.com/repos/input-output-hk/cardano-node/releases/latest')
            .then(resp => resp.json())
            .then(json => json.body.match(/.*Hydra binaries]\((.*)#tabs-constituents\).*/)[1])
            .then(link => {
                let isCurrent = link.match(/\d+/) == this.state.latest
                this.setState({ ...this.state.isCurrent, isCurrent })
                return link
            })
            .then(link => {
                let latest = link.match(/\d+.*/) + "#tabs-constituents"
                this.setState({ ...this.state.latest, latest })
            })
            .catch(err => {
                this.setState({err, hasErrors: true})
            })
    }
    render() {
        return (
            <>
                <ul>
                    <BuildListItem id={this.state.linux}>Linux</BuildListItem>
                    <BuildListItem id={this.state.macos}>MacOS</BuildListItem>
                    <BuildListItem id={this.state.win64}>Windows</BuildListItem>
                </ul>
                {!this.state.isCurrent
                    ? (<p>There are newer binaries available: <ul><BuildListItem id={this.state.latest}>latest release</BuildListItem></ul></p>) : (<></>)
                }
            </>
        );
    }
}

export default HydraBuildList;