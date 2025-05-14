import React, { useState } from "react";
import { faFileUpload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button, Modal, ProgressBar } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { addFileUser } from "../../redux/actionCreators/filefoldersActionCreators";

import { storage } from '../../API/firebase';  // Firebase Storage reference




const UploadFile = ({ currentFolder }) => {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null); // State for storing the file
  const [progress, setProgress] = useState(0); // State for file upload progress
  const dispatch = useDispatch();
  const { userId, userFiles } = useSelector(
    (state) => ({
      userId: state.auth.userId,
      userFiles: state.filefolders.userFiles,
    }),
    shallowEqual
  );

const handleFileSubmit = async (e) => {
  e.preventDefault();

  if (!file) return toast.dark("Please choose a file!");

  if (file.type !== "application/pdf") {
    return toast.dark("Only PDF files are allowed!");
  }

  // Check for duplicates
  const filteredFiles = currentFolder === "root folder"
    ? userFiles.filter(
        (file) => file.data.parent === "" && file.data.name === file.name
      )
    : userFiles.filter(
        (file) => file.data.parent === currentFolder.docId && file.data.name === file.name
      );

  if (filteredFiles.length > 0) {
    return toast.dark("This file already exists in the folder");
  }

  const formData = new FormData();
  formData.append("file", file);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:5000/upload");

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      setProgress((e.loaded / e.total) * 100);
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      const { url } = JSON.parse(xhr.responseText);  // Get the server URL

      // Update Firestore with the correct URL
      dispatch(
        addFileUser({
          uid: userId,
          parent: currentFolder?.docId || "",  // Handle root folder
          data: "",
          name: file.name,
          url,  // Store the URL from your server (not Firebase Storage)
          path: currentFolder === "root folder" ? [] : [
            ...currentFolder.data.path,
            { id: currentFolder.docId, name: currentFolder.data.name },
          ],
        })
      );

      setFile(null);
      setProgress(0);
      setShowModal(false);
      toast.success("File uploaded successfully!");
    } else {
      toast.error("Error uploading file");
    }
  };

  xhr.onerror = () => toast.error("Upload failed");

  xhr.send(formData);
};



  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>
            {progress && progress !== 100
              ? "Uploading..."
              : progress === 100
              ? "Uploaded"
              : "Upload PDF File"}
          </Modal.Title>
          <Button variant="white" style={{ cursor: "pointer" }} onClick={() => setShowModal(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </Modal.Header>
        <Modal.Body>
          {progress && progress !== 100 ? (
            <ProgressBar now={progress} label={`${progress}%`} />
          ) : (
            <form onSubmit={handleFileSubmit}>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <Button type="submit" className="form-control mt-4" variant="primary">
                Upload PDF
              </Button>
            </form>
          )}
        </Modal.Body>
      </Modal>
      <Button 
        onClick={() => setShowModal(true)}
        variant="outline-dark"   
        className="border-1 d-flex align-items-center justify-content-between rounded-2"
      >
        <FontAwesomeIcon icon={faFileUpload} /> 
        &nbsp; Upload File
      </Button>
    </>
  );
};

export default UploadFile;
