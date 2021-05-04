import React, { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import { MinOrMax } from "../types/ProblemTypes";
import { ErrorMessage } from "@hookform/error-message";

// refactor me, NIMBUS has same type defined
type Classification = "<" | "<=" | ">=" | "=" | "0";

interface FormData {
  values: number[];
  classifications: Classification[];
}

interface ClassificationsInputFormProps {
  setClassifications: React.Dispatch<React.SetStateAction<Classification[]>>;
  setClassificationLevels: React.Dispatch<React.SetStateAction<number[]>>;
  classifications: Classification[];
  classificationLevels: number[];
  nObjectives: number;
  objectiveNames: string[];
  ideal: number[];
  nadir: number[];
  directions: MinOrMax[];
}

function ClassificationsInputForm({
  setClassifications,
  setClassificationLevels,
  classifications,
  classificationLevels,
  nObjectives,
  objectiveNames,
  ideal,
  nadir,
  directions,
}: ClassificationsInputFormProps) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<FormData>({
    mode: "onBlur",
    defaultValues: {
      values: classificationLevels,
      classifications: classifications,
    },
  });

  const [tmpClassifications, SetTmpClassifications] = useState(classifications);

  useEffect(() => {
    SetTmpClassifications(classifications);
  }, [classifications]);

  useEffect(() => {
    reset({
      values: classificationLevels.map((v) => parseFloat(v.toPrecision(4))),
      classifications: classifications,
    });
  }, [classifications]);

  const classToHumanReadable = (c: Classification) => {
    switch (c) {
      case "<": {
        return "Improve";
      }
      case "<=": {
        return "Improve until";
      }
      case ">=": {
        return "Worsen until";
      }
      case "=": {
        return "Keep current value";
      }
      case "0": {
        return "Let change freely";
      }
    }
  };

  const onSubmit = (data: FormData) => {
    console.log(data);
    setClassifications(data.classifications);
    setClassificationLevels(data.values);
  };

  console.log("called form", JSON.stringify(classificationLevels));

  return (
    <Form action="" onSubmit={handleSubmit(onSubmit)}>
      <ListGroup>
        <ListGroup.Item variant="dark">
          <Row>
            <Col sm={8}>Class</Col>
            <Col sm={4}>Limit</Col>
          </Row>
        </ListGroup.Item>
        <ListGroup.Item>
          <Form.Group>
            {objectiveNames.map((name, i) => {
              return (
                <div key={`${name}`}>
                  <Row>
                    <Col sm={8}>
                      <Form.Label column="sm" key={`labelof${name}`}>
                        {name}
                      </Form.Label>
                      <Form.Control
                        key={`classcontrolof${name}`}
                        name={`classifications.${i}`}
                        as="select"
                        ref={register()}
                        onChange={(e) => {
                          const tmp = tmpClassifications;
                          tmpClassifications[i] = e.target
                            .value as Classification;
                          SetTmpClassifications([...tmp]);
                        }}
                      >
                        {["<", "<=", ">=", "=", "0"].map((v, i) => {
                          return (
                            <option
                              value={v as Classification}
                              key={`${v}${i}`}
                            >
                              {classToHumanReadable(v as Classification)}
                            </option>
                          );
                        })}
                      </Form.Control>
                    </Col>
                    <Col sm={4}>
                      <Form.Label
                        column="sm"
                        key={`labelofclass${name}`}
                      ></Form.Label>
                      <Form.Control
                        key={`controlof${name}`}
                        name={`values.${i}`}
                        defaultValue={`${classificationLevels[i].toPrecision(
                          4
                        )}`}
                        readOnly={
                          tmpClassifications[i] === ("=" as Classification) ||
                          tmpClassifications[i] === ("0" as Classification) ||
                          tmpClassifications[i] === ("<" as Classification)
                            ? true
                            : false
                        }
                        ref={register({
                          required: true,
                          pattern: {
                            value: /[+-]?([0-9]*[.])?[0-9]+/,
                            message: "Input not recognized as float.",
                          },
                          valueAsNumber: true,
                          validate: {
                            isFloat: (v) =>
                              !Number.isNaN(parseFloat(v)) ||
                              "Input must be float",
                          },
                          min: {
                            value: directions[i] === 1 ? ideal[i] : nadir[i],
                            message: `Value too small. Must be greater than ${
                              directions[i] === 1 ? ideal[i] : nadir[i]
                            }`,
                          },
                          max: {
                            value: directions[i] === -1 ? ideal[i] : nadir[i],
                            message: `Value too too large. Must be less than ${
                              directions[i] === -1 ? ideal[i] : nadir[i]
                            }`,
                          },
                        })}
                      />
                      <ErrorMessage
                        errors={errors}
                        name={`values.${i}`}
                        render={({ message }) => <p>{message}</p>}
                      />
                    </Col>
                  </Row>
                </div>
              );
            })}
          </Form.Group>
        </ListGroup.Item>
        <Button type="submit">Set</Button>
      </ListGroup>
    </Form>
  );
}

export default ClassificationsInputForm;