// NPM
import React, { Component } from 'react';
//import Media from 'react-media';
import styled from 'styled-components';
import GoogleMapReact from 'google-map-react';
import { fitBounds } from 'google-map-react/utils';
import { Checkbox } from 'semantic-ui-react';
import Media from 'react-media';

// COMPONENTS
import TopBar from './../../shared_components/TopBar';

import BrandFooter from './../../shared_components/BrandFooter';
import Filters from './components/Filters';
import Results from './components/Results';
import MapMaker from './../../shared_components/MapMarker';

// ACTIONS/CONFIG
import { media } from '../../libs/styled';
// import { foodList } from "../../data/food";

// STYLES
import { Page, PageContent } from './../../shared_components/layout/Page';

const MapWrapper = styled.div`
  // width: 42%;
  width: 100%;
  background: #5cb89e;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 900px;
  margin-top: 1.8em;

  h3 {
    color: #fff;
    font-size: 52px;
    text-align: center;
    max-width: 400px;
  }
`;

const ServicesWrapper = styled.div`
  width: 100%;
  min-height: 90vh;

  ${media.minLarge} {
    // width: 58%;
  }
`;

const MapToggle = styled.div`
  display: flex;
  flex-flow: row-reverse;
  padding-right: 1em;
  //padding-bottom: 1em;
`;

const defaultCenter = {
  lat: 48.856614,
  lng: 2.3522219000000177,
};
const defaultZoom = 11;

export default class ResultsScene extends Component {
  state = {
    center: defaultCenter,
    zoom: defaultZoom,
    markers: [],
    showMap: false,
  };

  static propTypes = {};

  getMarkerLatLngs = props => {
    return props.service_data
      .filter(({ latitude, longitude }) => latitude && longitude)
      .map(service => ({
        key: service.objectId,
        lat: parseFloat(service.geo.lat),
        lng: parseFloat(service.geo.lng),
        name: service.name,
        id: service.objectId,
        hover: false,
      }));
  };

  getCenterAndZoom = (markers, props) => {
    if (!markers.length) {
      if (props.latitude && props.longitude) {
        const center = { lat: parseFloat(props.latitude), lng: parseFloat(props.longitude) };
        return { center: center, zoom: defaultZoom };
      } else {
        return { center: defaultCenter, zoom: defaultZoom };
      }
    }
    if (markers.length === 1) {
      return { center: markers[0], zoom: defaultZoom };
    }
    const bounds = new window.google.maps.LatLngBounds();
    for (const marker of markers) {
      bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng));
    }
    return {
      center: { lat: bounds.getCenter().lat(), lng: bounds.getCenter().lng() },
      zoom: defaultZoom,
    };
  };

  componentWillReceiveProps(nextProps) {
    const hasLocationsChanged =
      nextProps.service_data.map(item => item.name).join(',') ===
      this.props.service_data.map(item => item.name).join(',');

    if (hasLocationsChanged) {
      const currentMarkers = this.getMarkerLatLngs(this.props);
      const newMarkers = this.getMarkerLatLngs(nextProps);
      const { center, zoom } = this.getCenterAndZoom(newMarkers, nextProps);
      this.setState({ center, zoom, markers: newMarkers });
    }
  }

  componentDidMount() {
    const { center, zoom } = this.getCenterAndZoom([], this.props);
    this.setState({ center, zoom, markers: [] });
  }

  toggleMap = () => {
    this.setState({ showMap: !this.state.showMap });
  };

  setMarkerHoverState(id, state) {
    this.setState({
      markers: this.state.markers.map(marker => {
        if (marker.id === id) {
          marker.hover = state;
        }
        return marker;
      }),
    });
  }

  onCardOver = e => {
    this.setMarkerHoverState(e, true);
  };

  onCardLeave = e => {
    this.setMarkerHoverState(e, false);
  };

  render() {
    const { props } = this;
    const { center, zoom, markers } = this.state;
    return (
      <Page topPush>
        <TopBar {...props} fixed />
        <span>
          <Filters {...props} />
          <Media query={`(min-width: 600px)`}>
            {matches =>
              matches ? (
                <MapToggle>
                  <Checkbox color="green" toggle onClick={this.toggleMap} /> &nbsp;&nbsp;
                  <div>
                    <h3 onClick={this.toggleMap}>Show Map</h3>
                  </div>
                </MapToggle>
              ) : (
                <span />
              )
            }
          </Media>
        </span>
        <PageContent flex>
          <ServicesWrapper>
            {/* <SearchFilters {...props} /> */}
            <Results
              {...props}
              onCardOver={this.onCardOver}
              onCardLeave={this.onCardLeave}
              data={props.service_data}
              showMap={this.state.showMap}
            />
          </ServicesWrapper>

          <MapWrapper style={{ display: this.state.showMap ? 'flex' : 'none' }}>
            <br />
            <GoogleMapReact
              center={center}
              zoom={zoom}
              bootstrapURLKeys={{
                key: 'AIzaSyBzMYIINQ6uNANLfPeuZn5ZJlz-8pmPjvc',
              }}
            >
              {markers.map(marker => (
                <MapMaker {...marker} scale={1} color="#4fb798" />
              ))}
            </GoogleMapReact>
          </MapWrapper>
        </PageContent>
        <BrandFooter withTopBorder withPadding />
      </Page>
    );
  }
}
