import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getAllThemes } from "../api/themes";
import { getAllMaterials } from "../api/materials";
import {
  API_HOST,
  filterArray,
  filterMaterialsArray,
  filterMeasurements,
  filterObject,
  formatArray,
  formatArrayMeasurements,
  onDeleteItems,
  onValidatePairs,
} from "../utils/utils";

import SelectForm from "./SelectForm";
import Upload from "./Upload";
import { getAllMeasurements } from "../api/measurements";
import { storage } from "../firebase/firebase";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const EditBody = ({ painting }) => {
  const {
    materials: painting_materials,
    name,
    description,
    stock,
    active,
    image_url,
    theme,
    id,
    measurements: painting_measurements,
  } = painting;

  const [themes, setThemes] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState([]);
  const [measurementsOptions, setMeasurementsOptions] = useState([]);
  const [initialMaterials, setInitialMaterials] = useState([]);
  const [initialMeasurements, setInitialMeasurements] = useState([]);
  const [urlImg, setUrlImg] = useState(null);
  const [measurements, setMeasurements] = useState([]);

  const history = useHistory();

  const { register, handleSubmit, errors, setValue } = useForm();

  useEffect(() => {
    register({ name: "materials" }, { required: true });
    register({ name: "measurements" }, { required: true });
    register({ name: "theme_id" }, { required: true });
    register({ name: "active" });
    register({ name: "image_url" }, { required: true });
  }, []);

  useEffect(() => {
    const idsMaterials = filterMaterialsArray(painting_materials);
    const idsMeasurements = filterMaterialsArray(painting_measurements);
    setInitialMaterials(idsMaterials);
    setInitialMeasurements(idsMeasurements);
    const idTheme = theme.id;
    setValue("materials", idsMaterials);
    setValue("measurements", idsMeasurements);
    setValue("theme_id", idTheme);
    setValue("image_url", image_url);
    setValue("active", active);
  }, []);

  const onSubmitData = (data) => {
    const flag = onValidatePairs(
      selectedMaterial,
      selectedMeasurement,
      measurements
    );

    if (flag) {
      const deleteMaterials = onDeleteItems(initialMaterials, data.materials);
      const deleteMeasurements = onDeleteItems(
        initialMeasurements,
        data.measurements
      );
      const bodyMaterials = {
        materials: deleteMaterials,
      };
      const bodyMeasurements = {
        measurements: deleteMeasurements,
      };

      const idToken = localStorage.getItem('idToken');
      const authStr = 'Bearer '.concat(idToken);
      axios
        .put(`${API_HOST}/paintings/${id}`, data, {headers: {'authorization': authStr} })
        .then((response) => {
          const { error, message } = response.data;
          if (error) {
            Swal.fire({
              title: "¡Oops!",
              text: `${message}`,
              icon: "error",
            });
          } else {
            return axios.delete(`${API_HOST}/paintings/materials/${id}`, {
              data: bodyMaterials,
              headers: {'authorization': authStr}
            });
          }
        })
        .then((response) => {
          const { error, message } = response.data;
          if (error) {
            Swal.fire({
              title: "¡Oops!",
              text: `${message}`,
              icon: "error",
            });
          } else {
            return axios.delete(`${API_HOST}/paintings/measurements/${id}`, {
              data: bodyMeasurements,
              headers: {'authorization': authStr}
            });
          }
        })
        .then((response) => {
          const { error, message } = response.data;
          if (error) {
            Swal.fire({
              title: "¡Oops!",
              text: `${message}`,
              icon: "error",
            });
          } else {
            Swal.fire({
              title: "¡Cuadro actualizado!",
              text: "Has actualizado un cuadro exitosamente",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
            setTimeout(() => {
              history.push("/paintings");
            }, 1500);
          }
        });
    } else {
      Swal.fire({
        title: "¡Oops!",
        text:
          "Revisa que tus medidas coincidan con los materiales seleccionados",
        icon: "warning",
      });
    }
  };

  useEffect(() => {
    getAllThemes().then((response) => {
      setThemes(formatArray(response));
    });
  }, []);

  useEffect(() => {
    getAllMaterials().then((response) => {
      setMaterials(formatArray(response));
    });
    setSelectedMaterial(filterMaterialsArray(painting_materials));
  }, []);

  useEffect(() => {
    if (materials) {
      const idsMeasurements = formatArrayMeasurements(
        painting_measurements,
        materials
      );
      setSelectedMeasurement(filterArray(idsMeasurements));
    }
  }, [materials]);

  useEffect(() => {
    getAllMeasurements().then((response) => {
      setMeasurements(response);
      let resultArray = [];
      for (var i = 0; i < selectedMaterial.length; i++) {
        if (materials) {
          let formatMeasurements = formatArrayMeasurements(
            filterMeasurements(response, selectedMaterial[i]),
            materials
          );
          resultArray = resultArray.concat(formatMeasurements);
        }
      }
      setMeasurementsOptions(resultArray);
    });
  }, [selectedMaterial, materials]);

  if (!materials || !measurementsOptions) return null;

  const handleChange = (selectedOption, type) => {
    if (type === "materials") {
      const arrayIds = filterArray(selectedOption);
      setSelectedMaterial(arrayIds);
      setValue("materials", arrayIds);
    } else if (type === "measurements") {
      const arrayIds = filterArray(selectedOption);
      setSelectedMeasurement(arrayIds);
      setValue("measurements", arrayIds);
    } else {
      setValue("theme_id", filterObject(selectedOption));
    }
  };

  const onCancel = () => {
    if (urlImg) {
      storage
        .ref("/")
        .child(urlImg)
        .delete()
        .then(() => history.push("/paintings"))
        .catch(() => console.log("Error"));
    } else {
      history.push("/paintings");
    }
  };

  return (
    <div className="card-body card-body-painting">
      <form onSubmit={handleSubmit(onSubmitData)}>
        <div className="form-row">
          <div className="name">Nombre: </div>

          <div className="value">
            <div className="input-group">
              <input
                className="input--style-5"
                type="text"
                name="name"
                ref={register({
                  required: true,
                })}
                defaultValue={name}
              />
              {errors.name && (
                <div className="error">Ingresa el nombre del cuadro</div>
              )}
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="name">Descripción: </div>
          <div className="value">
            <div className="input-group">
              <input
                className="input--style-5"
                type="text"
                name="description"
                ref={register({ required: false })}
                defaultValue={description}
              />
              {errors.description && (
                <div className="error">Ingresa la descripción del cuadro</div>
              )}
            </div>
          </div>
        </div>
        <div className="form-row">
          <label className="label label--block">Disponible?</label>
          <div className="input-group mt-4">
            <div className="form-check form-check-inline custom-check">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio1"
                value="option1"
                onChange={() => setValue("active", true)}
                defaultChecked={active}
              />
              <label className="form-check-label" htmlFor="inlineRadio1">
                Sí
              </label>
            </div>
            <div
              className="form-check form-check-inline custom-check"
              id="no-check"
            >
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio2"
                value="option2"
                onChange={() => setValue("active", false)}
                defaultChecked={!active}
              />
              <label className="form-check-label" htmlFor="inlineRadio2">
                No
              </label>
            </div>
          </div>
        </div>
        <SelectForm
          options={materials}
          placeholder="Selecciona el material"
          noOptionsMessage="No se encontró ningún material"
          onChange={handleChange}
          name="materials"
          label="Material"
          error={errors.materials}
          errorMessage="Selecciona el material del cuadro"
          isMulti={true}
          value={formatArray(painting_materials)}
        />

        <SelectForm
          options={measurementsOptions}
          placeholder="Selecciona las medidas"
          noOptionsMessage="No se encontró ninguna dimensión"
          onChange={handleChange}
          name="measurements"
          label="Medidas"
          error={errors.measurements}
          errorMessage="Selecciona las medidas del cuadro"
          isMulti={true}
          value={formatArrayMeasurements(painting_measurements, materials)}
        />

        <SelectForm
          options={themes}
          placeholder="Selecciona los temas"
          noOptionsMessage="No se encontró ningún tema"
          onChange={handleChange}
          name="theme_id"
          label="Tema"
          error={errors.theme_id}
          errorMessage="Selecciona el tema del cuadro"
          isMulti={false}
          value={{ label: theme.name, value: theme.id }}
        />

        <div className="form-row">
          <div className="name">Foto</div>
          <div className="value">
            <Upload
              setValue={setValue}
              setUrlImg={setUrlImg}
              error={errors.image_url}
              image_url={image_url}
            />
          </div>
        </div>
        <div className="btn-custom-container" id="container-btn">
          <button className="btn btn--radius-2" type="submit" id="btn-submit">
            Editar cuadro
          </button>
          <button
            type="button"
            className="btn btn--radius-2 btn-cancel"
            id="btn-cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBody;
