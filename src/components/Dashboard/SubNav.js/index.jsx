import React from 'react';
import { Col } from 'react-bootstrap';
import CreateFolder from '../../CreateFolder/index.jsx';
import UploadFile from '../../UploadFile/index.jsx';
import BreadCrum from '../BreadCrum.js/index.jsx';
import DeleteButton from '../../DeleteButton/index.jsx';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';


const SubNav = ({ currentFolder }) => {
  
  // grab isAdmin
  const { isAdmin } = useSelector(state => ({
    isAdmin: state.auth.isAdmin,
  }), shallowEqual);
  
  return (
    <Col
      md={12}
      className={'d-flex align-items-center px-5 pt-3 justify-content-between'}>
      {currentFolder && currentFolder !== 'root folder' ? (
        <>
          <BreadCrum currentFolder={currentFolder} />
          {isAdmin && (
            <div className="ml-auto col-md-6 d-flex justify-content-end">
              <DeleteButton currentFolder={currentFolder} />
              &nbsp;
              <UploadFile currentFolder={currentFolder} />
              &nbsp;
              <CreateFolder currentFolder={currentFolder} />
            </div>
          )}
        </>
      ) : (
        <>
          <p>Root</p>
          {isAdmin && (
            <div className="ml-auto col-md-6 d-flex justify-content-end">
              <DeleteButton currentFolder={currentFolder} />
              &nbsp;
              <UploadFile currentFolder={currentFolder} />
              &nbsp;
              <CreateFolder currentFolder={currentFolder} />
            </div>
          )}
        </>
      )}
    </Col>
  );
};

export default SubNav;
