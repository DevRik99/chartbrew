import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import {
  Avatar, Button, Card, Checkbox, Divider,
  Modal, Spacer, Switch, Tooltip,
} from "@nextui-org/react";

import {
  ArrowRight, CloseSquare, Delete, InfoSquare, Swap, TickSquare,
} from "react-iconly";
import { IoCaretForward } from "react-icons/io5";

import connectionImages from "../../../config/connectionImages";
import { generateDashboard } from "../../../actions/project";
import Container from "../../../components/Container";
import Row from "../../../components/Row";
import Text from "../../../components/Text";
import useThemeDetector from "../../../modules/useThemeDetector";

function CustomTemplateForm(props) {
  const {
    template, connections, onBack, projectId, onComplete, isAdmin, onDelete,
    onCreateProject,
  } = props;

  const [selectedConnections, setSelectedConnections] = useState({});
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmation, setDeleteConfimation] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formStatus, setFormStatus] = useState("");

  const isDark = useThemeDetector();

  useEffect(() => {
    if (template && template.model.Connections) {
      const newSelectedConnections = {};
      template.model.Connections.forEach((c) => {
        newSelectedConnections[c.id] = {
          id: c.id,
          name: c.name,
          active: true,
          createNew: false,
        };
      });

      setSelectedConnections(newSelectedConnections);
    }

    if (template && template.model && template.model.Charts) {
      const charts = [];
      template.model.Charts.forEach((c) => {
        charts.push(c.tid);
      });
      setSelectedCharts(charts);
    }
  }, [template]);

  useEffect(() => {
    if (projectId && formStatus === "waitingForProject") {
      _generateTemplate();
    }
  }, [projectId]);

  const _getExistingConnections = (connection) => {
    // check existing connections
    const foundConnections = [];
    let sameConnection;
    connections.forEach((c) => {
      if (c.id === connection.id) {
        sameConnection = c;
      }

      if (c.type === connection.type) {
        // look for more compatibilities
        switch (connection.type) {
          case "api":
            if (c.host === connection.host) {
              foundConnections.push(c);
            }
            break;
          case "mongodb":
          case "mysql":
          case "potgres":
            if (
              c.connectionString === connection.connectionString
              || c.dbName === connection.dbName
            ) {
              foundConnections.push(c);
            }
            break;
          case "firestore":
          case "realtimedb":
            if (c.firebaseServiceAccount === connection.firebaseServiceAccount) {
              foundConnections.push(c);
            }
            break;
          case "googleAnalytics":
            if (c.oauth_id === connection.oauth_id) {
              foundConnections.push(c);
            }
            break;
          default:
            break;
        }
      }
    });

    // add the same connection to the end of the array to keep track of it
    if (sameConnection) {
      foundConnections.push(sameConnection);
    }

    return foundConnections;
  };

  const _onToggleConnection = (cid) => {
    const newList = _.clone(selectedConnections);
    newList[cid].active = !newList[cid].active;
    setSelectedConnections(newList);
  };

  const _onToggleCreateNew = (cid) => {
    const newList = _.clone(selectedConnections);

    if (newList[cid]) {
      newList[cid].createNew = !newList[cid].createNew;
      setSelectedConnections(newList);
    }
  };

  const _onChangeSelectedCharts = (tid) => {
    const newCharts = [].concat(selectedCharts) || [];
    const isSelected = _.indexOf(selectedCharts, tid);

    if (isSelected === -1) {
      newCharts.push(tid);
    } else {
      newCharts.splice(isSelected, 1);
    }

    setSelectedCharts(newCharts);
  };

  const _onSelectAll = () => {
    if (template && template.model.Charts) {
      const newSelectedCharts = [];
      template.model.Charts.forEach((chart) => {
        newSelectedCharts.push(chart.tid);
      });
      setSelectedCharts(newSelectedCharts);
    }
  };

  const _onDeselectAll = () => {
    setSelectedCharts([]);
  };

  const _getDependency = (chart) => {
    if (Object.keys(selectedConnections).length < 1) return "";

    const datasets = chart.Datasets;
    let dependency = "";

    for (let i = 0; i < datasets.length; i++) {
      if (selectedConnections[datasets[i].Connection]
        && !selectedConnections[datasets[i].Connection].active
      ) {
        dependency = selectedConnections[datasets[i].Connection].name;
        break;
      }
    }

    if (dependency && _.indexOf(selectedCharts, chart.tid) > -1) {
      _onChangeSelectedCharts(chart.tid);
    }

    return dependency;
  };

  const _generateTemplate = () => {
    setIsCreating(true);

    if (!projectId && !formStatus) {
      setFormStatus("waitingForProject");
      onCreateProject();
      return;
    }

    const data = {
      template_id: template.id,
      charts: selectedCharts,
      connections: selectedConnections,
    };

    generateDashboard(projectId, data, "custom")
      .then(() => {
        setTimeout(() => {
          setIsCreating(false);
          onComplete();
        }, 2000);
      })
      .catch(() => { setIsCreating(false); });
  };

  return (
    <Container>
      <Row align="center">
        <Avatar icon={<IoCaretForward />} onClick={onBack} squared />
        <Spacer x={0.5} />
        <Text size="h4">
          {template.name}
        </Text>
      </Row>
      <Spacer y={1} />
      <Divider />
      <Spacer y={1} />
      <Row>
        <Text b>Connections</Text>
      </Row>
      <Spacer y={0.5} />
      <div className="grid grid-cols-12 gap-2">
        {template.model.Connections && template.model.Connections.map((c) => {
          const existingConnections = _getExistingConnections(c);

          return (
            <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3" key={c.id}>
              <Card variant="bordered">
                <Card.Header>
                  <Switch
                    checked={selectedConnections[c.id] && selectedConnections[c.id].active}
                    style={{ position: "absolute", top: 15, right: 10 }}
                    onChange={() => _onToggleConnection(c.id)}
                    size="xs"
                  />
                  <img src={connectionImages(isDark)[c.type]} alt={"Connection logo"} width="34px" height="34px" />
                  <Text>{c.name}</Text>
                </Card.Header>
                <Card.Body>
                  <Checkbox
                    isSelected={
                      (selectedConnections[c.id]
                      && selectedConnections[c.id].createNew)
                      || !existingConnections
                      || existingConnections.length < 1
                    }
                    onChange={() => _onToggleCreateNew(c.id)}
                    isDisabled={!existingConnections || existingConnections.length < 1}
                    size="sm"
                  >
                    New connection
                  </Checkbox>
                </Card.Body>
                {existingConnections && existingConnections.length > 0 && (
                  <Card.Footer>
                    <Row align="center">
                      <Swap size="small" />
                      <Spacer x={0.2} />
                      <Text small>Existing connection found</Text>
                    </Row>
                  </Card.Footer>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {template && template.model && (
        <>
          <Spacer y={1} />
          <Row>
            <Text b>{"Select which charts you want Chartbrew to create for you"}</Text>
          </Row>
          <Spacer y={0.5} />
          <div className="grid grid-cols-12 gap-1">
            {template.model.Charts && template.model.Charts.map((chart) => (
              <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3" key={chart.tid}>
                <Checkbox
                  isSelected={
                    _.indexOf(selectedCharts, chart.tid) > -1
                  }
                  onChange={() => _onChangeSelectedCharts(chart.tid)}
                  size="sm"
                >
                  {chart.name}
                </Checkbox>
                {_getDependency(chart) && (
                  <>
                    {" "}
                    <Tooltip
                      content={`This chart depends on ${_getDependency(chart)} to display properly.`}
                      css={{ zIndex: 99999 }}
                    >
                      <InfoSquare size="small" />
                    </Tooltip>
                  </>
                )}
              </div>
            ))}
          </div>

          <Spacer y={1} />
          <Row>
            <Button
              iconRight={<TickSquare />}
              bordered
              onClick={_onSelectAll}
              size="sm"
              auto
            >
              Select all
            </Button>
            <Spacer x={0.5} />
            <Button
              iconRight={<CloseSquare />}
              bordered
              onClick={_onDeselectAll}
              size="sm"
              auto
            >
              Deselect all
            </Button>
          </Row>
        </>
      )}

      <Spacer y={1} />
      <Row justify="flex-end">
        {isAdmin && (
          <Button
            color="danger"
            flat
            iconRight={<Delete />}
            onClick={() => setDeleteConfimation(true)}
            auto
          >
            Delete template
          </Button>
        )}
        <Spacer x={0.5} />
        <Button
          primary
          onClick={_generateTemplate}
          disabled={!selectedCharts.length}
          iconRight={<ArrowRight />}
          auto
          isLoading={isCreating}
        >
          Generate from template
        </Button>
      </Row>

      {isAdmin && (
        <Modal
          open={deleteConfirmation}
          closeButton
          onClose={() => setDeleteConfimation(false)}
        >
          <Modal.Header>
            <Text size="h4">Are you sure you want to delete this template?</Text>
          </Modal.Header>
          <Modal.Body>
            {"After you delete this template you will not be able to create charts from it. Deleting the template will not affect any dashboards."}
          </Modal.Body>
          <Modal.Footer>
            <Button
              flat
              color="warning"
              onClick={() => setDeleteConfimation(false)}
              auto
            >
              Close
            </Button>
            <Button
              color="danger"
              iconRight={<Delete />}
              onClick={() => {
                setDeleteLoading(true);
                onDelete(template.id);
              }}
              auto
              isLoading={deleteLoading}
            >
              Delete template
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}

CustomTemplateForm.propTypes = {
  template: PropTypes.object.isRequired,
  connections: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onComplete: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  onCreateProject: PropTypes.func,
};

CustomTemplateForm.defaultProps = {
  isAdmin: false,
  onCreateProject: () => {},
  projectId: "",
};

export default CustomTemplateForm;