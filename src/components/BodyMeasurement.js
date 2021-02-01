import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { getAllMaterials } from "../api/materials";
import { findMaterial, formatArray } from "../utils/utils";
import SelectForm from "./SelectForm";

const BodyMeasurement = ({ btnText }) => {
  const [materials, setMaterials] = useState(null);
  const history = useHistory();
  let id, height, width, active = true, price, material_id, material_name, textBtn = btnText;

  const measurement = JSON.parse(localStorage.getItem('actualMeasurement'));
  console.log(measurement);

  if(measurement){
    id = measurement.id;
    height = measurement.height;
    width = measurement.width;
    active = measurement.active;
    price = measurement.price;
    material_id = measurement.material_id;
  };

  const { register, handleSubmit, errors, setValue } = useForm();

  const onSubmitData = (data) => {
    console.log(data);
  }

  const onCancel = () => {
    history.push('/measurements');
    localStorage.clear();
  }

  useEffect(() => {
    getAllMaterials().then((response) => {
      setMaterials(formatArray(response.materials));
    })
  }, [])

  useEffect(() => {
    register({ name: "height" }, { required: true });
    register({ name: "width" }, { required: true });
    register({ name: "price" }, { required: true });
    register({ name: "material_id" }, { required: true });
    if(active){
      register({ name: "active" });
      setValue('active', active);
    }
    else register({name: "active"}, {required: true});
  }, []);

  if(!materials) return null;

  console.log(materials)
  material_name = findMaterial(materials, material_id)

  const handleChange = (selectedOption) => {
    setValue('material_id', selectedOption.value);
  }
  
  return (
    <div className="card-body card-body-painting">
      <form onSubmit={handleSubmit(onSubmitData)}>
        <div className="form-row">
          <div className="name">Ancho (m): </div>
          <div className="value">
            <div className="input-group">
              <input
                className="input--style-5"
                type="text"
                name="width"
                ref={register({
                  required: true,
                })}
                defaultValue={width}
              />
              {errors.width && (
                <div className="error">Ingresa el ancho</div>
              )}
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="name">Alto (m): </div>
          <div className="value">
            <div className="input-group">
              <input
                className="input--style-5"
                type="text"
                name="height"
                ref={register({
                  required: true,
                })}
                defaultValue={height}
              />
              {errors.height && (
                <div className="error">Ingresa el alto</div>
              )}
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="name">Precio: </div>
          <div className="value">
            <div className="input-group">
              <input
                className="input--style-5"
                type="text"
                name="price"
                ref={register({
                  required: true,
                })}
                defaultValue={price}
              />
              {errors.price && (
                <div className="error">Ingresa el precio</div>
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
                defaultChecked={active === false ? false : true}
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
          name="material_id"
          label="Material"
          error={errors.material_id}
          errorMessage="Selecciona un material"
          isMulti={false}
          value={{ label: material_name, value: material_id}}
        />
        <div className="btn-custom-container" id="container-btn">
          <button className="btn btn--radius-2" type="submit" id="btn-submit">
            {textBtn}
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
}

export default BodyMeasurement